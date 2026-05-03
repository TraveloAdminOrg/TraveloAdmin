import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";
import {
  signInSchema,
  type SignInInput,
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
} from "../../schemas/auth.schema";
import { parseApiError } from "../../lib/error";

const FIELD_IDS = {
  email: "signin-email",
  emailError: "signin-email-error",
  password: "signin-password",
  passwordError: "signin-password-error",
} as const;

function getFriendlyAuthError(err: unknown): string {
  const parsed = parseApiError(err);
  // Status-aware copy first; fall back to backend message; fall back to generic.
  if (err instanceof AxiosError) {
    const status = err.response?.status;
    if (status === 401) return "Invalid email or password.";
    if (status === 403) return "This account is blocked. Contact support.";
    if (status === 404) return "Account not found.";
    if (status === 429) return "Too many attempts. Try again in a minute.";
    if (status && status >= 500) return "Server error. Please try again shortly.";
    if (!err.response) return "Network error. Check your connection.";
  }
  return parsed.message || "Sign-in failed. Please try again.";
}

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    mode: "onTouched", // validate after first blur, then re-validate on change
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: SignInInput) => {
    try {
      // Normalize email (lowercase + already trimmed by schema).
      await login({
        email: values.email.toLowerCase(),
        password: values.password,
      });

      toast.success("Welcome back!");
      const from = (location.state as { from?: Location })?.from?.pathname ?? "/";
      navigate(from, { replace: true });
    } catch (err) {
      const message = getFriendlyAuthError(err);
      console.error("[SignIn] failed:", err);
      toast.error(message);
    }
  };

  const isBusy = isSubmitting;

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-600 transition-colors hover:text-red-900 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Sign In
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your email and password to sign in!
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <fieldset disabled={isBusy} className="space-y-6">
            <div>
              <Label>
                Email <span className="text-error-500">*</span>
              </Label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    id={FIELD_IDS.email}
                    type="email"
                    name={field.name}
                    placeholder="info@gmail.com"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    autoComplete="email"
                    autoFocus
                    maxLength={EMAIL_MAX_LENGTH}
                    inputMode="email"
                    required
                    error={!!errors.email}
                    aria-invalid={!!errors.email}
                    aria-describedby={
                      errors.email ? FIELD_IDS.emailError : undefined
                    }
                  />
                )}
              />
              {errors.email && (
                <p
                  id={FIELD_IDS.emailError}
                  className="mt-1 text-xs text-error-500"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label>
                Password <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id={FIELD_IDS.password}
                      type={showPassword ? "text" : "password"}
                      name={field.name}
                      placeholder="Enter your password"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      autoComplete="current-password"
                      maxLength={PASSWORD_MAX_LENGTH}
                      required
                      error={!!errors.password}
                      aria-invalid={!!errors.password}
                      aria-describedby={
                        errors.password ? FIELD_IDS.passwordError : undefined
                      }
                    />
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p
                  id={FIELD_IDS.passwordError}
                  className="mt-1 text-xs text-error-500"
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox checked={keepLoggedIn} onChange={setKeepLoggedIn} />
                <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                  Keep me logged in
                </span>
              </div>
              <Link
                to="#!"
                className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Forgot password?
              </Link>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                size="sm"
                disabled={isBusy}
              >
                {isBusy ? "Signing in…" : "Sign in"}
              </Button>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
}
