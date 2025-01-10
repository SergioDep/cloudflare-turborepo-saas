"use client";

import Link from "next/link";
import { loginWithCredentialsAction } from "@/modules/auth/server/actions/login-with-credentials";
import { loginWithGoogleAction } from "@/modules/auth/server/actions/login-with-google";
import GoogleLogo from "@/modules/base/components/icons/brands/Google";
import { FloatingLabelInput } from "@/modules/base/components/ui-extended/floating-label-input";
import { FormRootMessage } from "@/modules/base/components/ui-extended/form-root-message";
import { PasswordInput } from "@/modules/base/components/ui-extended/password-input";
import { DEFAULT_LOGGEDIN_REDIRECT } from "@/modules/base/lib/config/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, LucideArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button, buttonVariants } from "@repo/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@repo/ui/components/form";
import { cn } from "@repo/ui/lib/utils";
import { SignInCredentialsSchema } from "@repo/validators/modules/auth/credentials";

export default function LoginForm({
  allowCredentials = false,
  allowRegister: allowRegistration = true,
}: {
  allowCredentials?: boolean;
  allowRegister?: boolean;
}) {
  const form = useForm<z.infer<typeof SignInCredentialsSchema>>({
    resolver: zodResolver(SignInCredentialsSchema),
    // important, otherwise the form will be uncontrolled
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onCredentialsFormSubmit(
    values: z.infer<typeof SignInCredentialsSchema>,
  ) {
    await loginWithCredentialsAction({ credentials: values });
  }

  async function handleGoogleLogin() {
    await loginWithGoogleAction({
      redirectTo: DEFAULT_LOGGEDIN_REDIRECT,
    });
  }

  const formSubmitDisabled =
    form.formState.isSubmitting ||
    form.formState.isLoading ||
    (form.formState.isSubmitted && form.formState.isSubmitSuccessful);

  return (
    <div className="w-full py-10 lg:w-full lg:rounded lg:px-10 lg:shadow">
      {allowCredentials && (
        <>
          <Form {...form}>
            <form
              className="w-full"
              onSubmit={form.handleSubmit(onCredentialsFormSubmit)}
            >
              <p
                tabIndex={0}
                role="heading"
                aria-label="Iniciar sesión en tu cuenta"
                className="text-2xl font-extrabold leading-6"
                aria-level={1}
              >
                Iniciar sesión
              </p>
              <div className="mt-4 w-full">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingLabelInput
                          type="email"
                          label="Correo electrónico"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mt-4 w-full">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <PasswordInput label="Contraseña" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormRootMessage
                className="mt-4"
                icon={<AlertTriangle size={16} />}
                message={form.formState.errors.root?.message}
                variant="destructive"
              />
              <div className="mt-4 w-full">
                <Button
                  type="submit"
                  disabled={formSubmitDisabled}
                  className="text-md w-full border bg-primary/90 py-4 font-bold leading-none text-primary-foreground hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary-foreground focus:ring-offset-2"
                >
                  {formSubmitDisabled ? "Cargando..." : "Iniciar sesión"}
                </Button>
              </div>
            </form>
          </Form>
          <div className="flex w-full items-center justify-between py-8">
            <hr className="w-full bg-primary/80" />
            <p className="whitespace-nowrap px-2.5 text-base font-medium leading-4 text-foreground/80">
              o entrar con
            </p>
            <hr className="w-full bg-primary/80" />
          </div>
        </>
      )}
      <button
        type="button"
        className="flex w-full items-center rounded-lg border border-primary-foreground px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
        aria-label="Continuar con Google"
        role="button"
        onClick={handleGoogleLogin}
      >
        <GoogleLogo />
        <p className="ml-4 text-base font-medium text-foreground">
          Continuar con Google
        </p>
      </button>
      {allowRegistration && (
        <div className="mt-8 flex w-full items-center justify-center">
          <p className="flex items-center text-sm font-medium leading-none text-foreground/80">
            ¿No tienes cuenta?{" "}
            <Link
              href="/register"
              className={cn(
                buttonVariants({
                  variant: "link",
                }),
                "flex h-auto items-center gap-1 py-0",
              )}
            >
              <span
                tabIndex={0}
                role="link"
                aria-label="Regístrate aquí"
                className="cursor-pointer text-sm font-medium leading-none text-primary underline"
              >
                Registrate
              </span>
              <LucideArrowRight size={16} />
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
