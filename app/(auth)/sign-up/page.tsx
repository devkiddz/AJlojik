import AuthCard from '@/components/auth/AuthCard';
import SignUpForm from '@/components/auth/SignUpForm';

export default function SignUpPage() {
  return (
    <main className="grid min-h-[calc(100dvh-5rem)] place-items-center px-4 py-10">
      <AuthCard
        eyebrow="AJ Logik Membership"
        title="Create your account"
        description="Save products, continue your cart, track orders and receive a personal AJ Logik experience.">
        <SignUpForm />
      </AuthCard>
    </main>
  );
}
