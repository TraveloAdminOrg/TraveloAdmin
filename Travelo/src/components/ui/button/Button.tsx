import { ReactNode, ButtonHTMLAttributes } from "react";

type ButtonSize = "sm" | "md" | "lg";
type ButtonVariant = "primary" | "outline" | "ghost" | "danger" | "success";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const SIZE: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-sm",
};

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-500 text-white shadow-sm shadow-brand-500/20 hover:bg-brand-600 active:bg-brand-700 disabled:bg-brand-300 disabled:shadow-none",
  outline:
    "border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-white/[0.04]",
  ghost:
    "bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-300 dark:hover:bg-white/5",
  danger:
    "bg-error-500 text-white shadow-sm shadow-error-500/20 hover:bg-error-600 active:bg-error-700 disabled:bg-error-300",
  success:
    "bg-success-500 text-white shadow-sm shadow-success-500/20 hover:bg-success-600 active:bg-success-700 disabled:bg-success-300",
};

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  loading = false,
  fullWidth = false,
  className = "",
  disabled = false,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      {...rest}
      className={[
        "relative inline-flex select-none items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900",
        "active:scale-[0.98]",
        SIZE[size],
        VARIANT[variant],
        isDisabled ? "cursor-not-allowed opacity-60" : "",
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={isDisabled}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </span>
      )}
      <span className={loading ? "invisible inline-flex items-center gap-2" : "inline-flex items-center gap-2"}>
        {startIcon && <span className="flex items-center">{startIcon}</span>}
        {children}
        {endIcon && <span className="flex items-center">{endIcon}</span>}
      </span>
    </button>
  );
};

export default Button;
