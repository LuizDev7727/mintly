import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import {
  signUpSchema,
  type SignUpFormType,
} from "@/schemas/auth/sign-up.schema";
import { PasswordChecker } from "./-components/password-checker";
import { AtSign, Eye, EyeOff, User } from "lucide-react";
import { useState } from "react";
import { AuthenticateWithGoogle } from "../-components/authenticate-with-google";

export const Route = createFileRoute("/auth/sign-up/")({
  head: () => ({
    meta: [
      { name: "description", content: "Create your Mintly account." },
      { title: "Sign Up | Mintly" },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  const [isPasswordInputVisible, setIsPasswordInputVisible] = useState(false);

  function togglePasswordVisibility() {
    setIsPasswordInputVisible(!isPasswordInputVisible);
  }

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormType>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {},
  });

  const password = watch("password");

  async function handleSignUp(formBody: SignUpFormType) {
    const { name, email, password } = formBody;
    console.log({ name, email, password });
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-muted-foreground text-sm">
          Enter your details below to get started
        </p>
      </div>

      <form onSubmit={handleSubmit(handleSignUp)} className="space-y-4">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <div className="relative">
              <Input
                className="peer ps-9"
                id={"name"}
                type="text"
                placeholder="John Doe"
                {...register("name")}
              />
              <div className="pointer-events-none absolute inset-y-0 inset-start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                <User aria-hidden="true" size={16} />
              </div>
            </div>
            {errors.name && <FieldError>{errors.name.message}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <div className="relative">
              <Input
                className="peer ps-9"
                id={"email"}
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
                id={"password"}
                {...register("password")}
                placeholder="*********"
                type={isPasswordInputVisible ? "text" : "password"}
              />
              <button
                aria-controls="password"
                aria-label={
                  isPasswordInputVisible ? "Hide password" : "Show password"
                }
                aria-pressed={isPasswordInputVisible}
                className="absolute inset-y-0 inset-e-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                onClick={togglePasswordVisibility}
                type="button"
              >
                {isPasswordInputVisible ? (
                  <EyeOff aria-hidden="true" size={16} />
                ) : (
                  <Eye aria-hidden="true" size={16} />
                )}
              </button>
            </div>
            {errors.password && (
              <FieldError>{errors.password.message}</FieldError>
            )}
            <PasswordChecker password={password} />
          </Field>

          <Field>
            <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="*********"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <FieldError>{errors.confirmPassword.message}</FieldError>
            )}
          </Field>
        </FieldGroup>

        <AuthenticateWithGoogle />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="text-center text-sm">
        Already have an account?{" "}
        <Link to="/auth" className="underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
