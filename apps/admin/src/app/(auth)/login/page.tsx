import MyLogo from "@/modules/base/components/icons/MyLogo";
import LoginForm from "@/modules/auth/components/forms/LoginForm";

export const runtime = "edge";

export default function Page() {
  return (
    <main className="container relative flex h-full min-h-svh items-center justify-center">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-center space-y-6 xl:px-8">
        <div className="relative z-20 flex items-center text-lg font-medium">
          <MyLogo className="mr-2 h-6 w-6" />
          My Cloudflare Turbo App
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
