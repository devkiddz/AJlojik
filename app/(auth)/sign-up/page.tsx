import AuthCard from '@/components/auth/AuthCard';
import AuthExperienceShell from '@/components/auth/AuthExperienceShell';
import SignUpForm from '@/components/auth/SignUpForm';

export default function SignUpPage() {
  return (
    <AuthExperienceShell>
      <AuthCard
        eyebrow="AJ Logik Membership"
        title="Create your account"
        description="Save products, continue your cart, track orders and receive a personal AJ Logik experience.">
        <SignUpForm />
      </AuthCard>
    </AuthExperienceShell>
  );
}
