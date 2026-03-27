import AuthForm from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Sign In - TaskFlow',
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
