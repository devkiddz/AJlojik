import 'dotenv/config';

import { hashPassword } from 'better-auth/crypto';

import { auth } from '../lib/auth';
import { prisma } from './seeds/seed-utils';

type AdminSpec = { email: string; password: string; name: string; ghost: boolean; aliases?: string[] };

async function ensureIdentity(spec: AdminSpec) {
  let user = await prisma.user.findFirst({ where: { email: { in: [spec.email, ...(spec.aliases ?? [])] } }, select: { id: true } });
  if (!user) {
    await auth.api.signUpEmail({ body: { email: spec.email, password: spec.password, name: spec.name } });
    user = await prisma.user.findUniqueOrThrow({ where: { email: spec.email }, select: { id: true } });
  }

  await prisma.user.update({ where: { id: user.id }, data: { name: spec.name, email: spec.email, emailVerified: true, isGhostDeveloper: spec.ghost, accountState: 'ACTIVE', lockedUntil: null, restrictionReason: null } });
  const credential = await prisma.account.findFirst({ where: { userId: user.id, providerId: 'credential' }, select: { id: true } });
  if (!credential) throw new Error(`Credential account is missing for ${spec.email}.`);
  await prisma.account.update({ where: { id: credential.id }, data: { password: await hashPassword(spec.password) } });
  await prisma.session.deleteMany({ where: { userId: user.id } });
  return user.id;
}

async function main() {
  const developerPassword = process.env.DEVELOPER_SUPER_ADMIN_PASSWORD;
  const adminPassword = process.env.AJLOJIK_SUPER_ADMIN_PASSWORD;
  if (!developerPassword || !adminPassword) throw new Error('Both Super Admin password environment variables are required.');
  const live = await prisma.workspace.findUniqueOrThrow({ where: { slug: 'aj-logik-live' }, select: { id: true } });
  const developerId = await ensureIdentity({ email: 'developer@rcentzlab.com', password: developerPassword, name: 'RcentzLab Developer', ghost: true, aliases: ['devkiddzadmin@recentzadmin.com'] });
  const adminId = await ensureIdentity({ email: 'admin@ajlojik.com', password: adminPassword, name: 'AJ Logik Super Admin', ghost: false });
  for (const userId of [developerId, adminId]) await prisma.workspaceMembership.upsert({ where: { workspaceId_userId: { workspaceId: live.id, userId } }, update: { role: 'SUPER_ADMIN', active: true }, create: { workspaceId: live.id, userId, role: 'SUPER_ADMIN', active: true } });
  console.log('Protected developer and AJ Logik Super Admin accounts are ready.');
}

main().then(() => prisma.$disconnect()).catch(async error => { console.error(error); await prisma.$disconnect(); process.exit(1); });
