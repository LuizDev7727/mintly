import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { ArrowRight, AtSign, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  signInSchema,
  type SignInFormType,
} from "@/schemas/auth/sign-in.schema";
import { AuthenticateWithGoogle } from "./-components/authenticate-with-google";

export const Route = createFileRoute("/auth/")({
  head: () => ({
    meta: [
      { name: "description", content: "Sign in to your Mintly account." },
      { title: "Sign In | Mintly" },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormType>({
    resolver: zodResolver(signInSchema),
  });

  async function handleSignIn(formBody: SignInFormType) {
    const { email, password } = formBody;
    console.log({ email, password });
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground text-sm">
          Enter your credentials to access your account
        </p>
      </div>

      <form onSubmit={handleSubmit(handleSignIn)} className="space-y-4">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <div className="relative">
              <Input
                className="peer ps-9"
                id="email"
                type="email"
                placeholder="john@example.com"
                {...register("email")}
              />
              <div className="pointer-events-none absolute inset-y-0 inset-start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                <AtSign aria-hidden="true" size={16} />
              </div>
            </div>
            {errors.email && <FieldError>{errors.email.message}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <div className="relative">
              <Input
                className="pe-9"
                id="password"
                placeholder="*********"
                type={isPasswordVisible ? "text" : "password"}
                {...register("password")}
              />
              <button
                aria-controls="password"
                aria-label={
                  isPasswordVisible ? "Hide password" : "Show password"
                }
                aria-pressed={isPasswordVisible}
                className="absolute inset-y-0 inset-e-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setIsPasswordVisible((v) => !v)}
                type="button"
              >
                {isPasswordVisible ? (
                  <EyeOff aria-hidden="true" size={16} />
                ) : (
                  <Eye aria-hidden="true" size={16} />
                )}
              </button>
            </div>
            {errors.password && (
              <FieldError>{errors.password.message}</FieldError>
            )}
          </Field>
        </FieldGroup>

        <AuthenticateWithGoogle />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          Log in to my Account
          <ArrowRight />
        </Button>
      </form>

      <p className="text-center text-sm">
        Don't have an account?{" "}
        <Link to="/auth/sign-up" className="underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
