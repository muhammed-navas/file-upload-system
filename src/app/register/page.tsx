import RegisterForm from "@/components/auth/Register";


export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-8">
        <RegisterForm />
      </div>
    </div>
  );
}