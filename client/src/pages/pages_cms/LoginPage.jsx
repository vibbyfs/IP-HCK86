import LoginForm from "../../components/dashboards/LoginForm";

export default function LoginPage() {
  return (
  <div className="min-h-screen bg-white text-neutral-900">
      <main
        id="home"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 min-h-svh flex items-center justify-center pt-20"
      >
        <LoginForm />
      </main>
    </div>
  );
}
