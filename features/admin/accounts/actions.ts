'use server';

import { hashPassword, verifyPassword } from 'better-auth/crypto';
import { revalidatePath } from 'next/cache';

import { getAdminAccess, requireAdminPermission } from '@/features/admin/auth/adminPermissions';
import { prisma } from '@/lib/prisma';

const text = (data: FormData, key: string) => String(data.get(key) ?? '').trim();

async function credentialAccount(userId: string) {
  return prisma.account.findFirst({ where: { userId, providerId: 'credential' }, select: { id: true, password: true } });
}

async function ensureTargetAccess(actorId: string, targetId: string) {
  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      isGhostDeveloper: true
    }
  });

  if (!target) throw new Error('Account was not found.');
  if (target.isGhostDeveloper && actorId !== target.id) throw new Error('This protected account is not available.');

  return target;
}

export async function updateOwnAdminAccount(formData: FormData) {
  const access = await getAdminAccess();
  const name = text(formData, 'name');
  const email = text(formData, 'email').toLowerCase();
  const currentPassword = text(formData, 'currentPassword');
  const newPassword = text(formData, 'newPassword');
  if (!name || !email || !currentPassword) throw new Error('Name, email, and current password are required.');

  const account = await credentialAccount(access.session.user.id);
  if (!account?.password || !(await verifyPassword({ hash: account.password, password: currentPassword }))) throw new Error('Current password is incorrect.');
  const conflict = await prisma.user.findFirst({ where: { email, id: { not: access.session.user.id } }, select: { id: true } });
  if (conflict) throw new Error('That email address is already in use.');
  if (newPassword && newPassword.length < 8) throw new Error('The new password must contain at least 8 characters.');

  await prisma.$transaction(async tx => {
    await tx.user.update({ where: { id: access.session.user.id }, data: { name, email } });
    if (newPassword) await tx.account.update({ where: { id: account.id }, data: { password: await hashPassword(newPassword) } });
    if (newPassword) await tx.session.deleteMany({ where: { userId: access.session.user.id, id: { not: access.session.session.id } } });
    await tx.adminAuditEvent.create({ data: { workspaceId: access.membership.workspaceId, actorId: access.session.user.id, action: 'ADMIN_SELF_UPDATED', targetType: 'STAFF', targetId: access.session.user.id, summary: `${name} updated their administrator account.` } });
  });
  revalidatePath('/admin/account');
}

export async function updateManagedAccount(formData: FormData) {
  const access = await requireAdminPermission('system:manage');
  const userId = text(formData, 'userId');
  const target = await ensureTargetAccess(access.session.user.id, userId);
  const name = text(formData, 'name');
  const email = text(formData, 'email').toLowerCase();
  const tier = text(formData, 'tier') || 'member';
  const state = ['ACTIVE', 'LOCKED', 'BANNED'].includes(text(formData, 'accountState')) ? text(formData, 'accountState') : 'ACTIVE';
  const reason = text(formData, 'restrictionReason') || null;
  const lockHours = Math.max(Number(text(formData, 'lockHours')) || 0, 0);
  const newPassword = text(formData, 'newPassword');
  const submittedVerification = formData.get('emailVerified');
  const emailVerified =
    submittedVerification !== null &&
    !['false', '0', 'off', 'no'].includes(String(submittedVerification).trim().toLowerCase());
  const emailChanged = target.email.toLowerCase() !== email;
  const verificationChanged = target.emailVerified !== emailVerified;

  if (!name || !email) throw new Error('Name and email are required.');
  if (newPassword && newPassword.length < 8) throw new Error('Replacement passwords must contain at least 8 characters.');
  const conflict = await prisma.user.findFirst({ where: { email, id: { not: userId } }, select: { id: true } });
  if (conflict) throw new Error('That email address is already in use.');
  const account = newPassword ? await credentialAccount(userId) : null;

  await prisma.$transaction(async tx => {
    await tx.user.update({ where: { id: userId }, data: { name, email, tier, emailVerified: formData.get('emailVerified') === 'on', accountState: state, restrictionReason: state === 'ACTIVE' ? null : reason, lockedUntil: state === 'LOCKED' && lockHours ? new Date(Date.now() + lockHours * 3_600_000) : null } });
    if (newPassword && account) await tx.account.update({ where: { id: account.id }, data: { password: await hashPassword(newPassword) } });
    if (state !== 'ACTIVE' || newPassword || verificationChanged || emailChanged) {
      await tx.session.deleteMany({ where: { userId } });
    }
    await tx.adminAuditEvent.create({ data: { workspaceId: access.membership.workspaceId, actorId: access.session.user.id, action: 'USER_ACCOUNT_UPDATED', targetType: 'USER', targetId: userId, summary: `${name}'s account was updated by Super Admin.`, metadata: {
      accountState: state,
      tier,
      passwordReset: Boolean(newPassword),
      emailVerified,
      verificationChanged,
      emailChanged
    } } });
  });
  revalidatePath('/admin/accounts');
  revalidatePath(`/admin/accounts/${userId}`);
}
