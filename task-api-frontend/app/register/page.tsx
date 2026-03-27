import AuthForm from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Create Account - TaskFlow',
};

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
