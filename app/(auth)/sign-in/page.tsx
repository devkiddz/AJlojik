import AuthCard from '@/components/auth/AuthCard';
import AuthExperienceShell from '@/components/auth/AuthExperienceShell';
import SignInForm from '@/components/auth/SignInForm';

export default function SignInPage() {
  return (
    <AuthExperienceShell>
      <AuthCard
        eyebrow="Welcome Back"
        title="Sign in to AJ Logik"
        description="Continue your shopping journey, saved products, active orders and personal recommendations.">
        <SignInForm />
      </AuthCard>
    </AuthExperienceShell>
  );
}
