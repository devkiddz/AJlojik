import AuthCard from '@/components/auth/AuthCard';
import AuthExperienceShell from '@/components/auth/AuthExperienceShell';
import SignInForm from '@/components/auth/SignInForm';

export default function AdminLoginPage() {
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  return (
    <AuthExperienceShell>
      <AuthCard
        eyebrow="Controlled access"
        title="Admin workspace"
        description="Sign in with an authorized staff or Super Admin identity. Your workspace role determines every available operation.">
        <SignInForm callbackURL="/admin" showAdminLink={false} googleEnabled={googleEnabled} />
      </AuthCard>
    </AuthExperienceShell>
  );
}
