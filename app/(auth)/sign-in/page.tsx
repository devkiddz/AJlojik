import AuthCard from '@/components/auth/AuthCard';
import SignInForm from '@/components/auth/SignInForm';

export default function SignInPage() {
  return (
    <main className="grid min-h-[calc(100dvh-5rem)] place-items-center px-4 py-10">
      <AuthCard
        eyebrow="Welcome Back"
        title="Sign in to AJ Logik"
        description="Continue your shopping journey, saved products, active orders and personal recommendations.">
        <SignInForm />
      </AuthCard>
    </main>
  );
}
