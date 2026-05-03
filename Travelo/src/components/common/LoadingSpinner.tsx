interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  fullPage?: boolean;
  label?: string;
}

const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-9 w-9 border-[3px]",
  lg: "h-14 w-14 border-[3px]",
};

export default function LoadingSpinner({
  size = "md",
  fullPage = false,
  label,
}: LoadingSpinnerProps) {
  const dim = sizeMap[size];

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        <div
          className={`${dim} rounded-full border-gray-200 dark:border-gray-700`}
        />
        <div
          className={`${dim} absolute inset-0 animate-spin rounded-full border-transparent border-t-brand-500 dark:border-t-brand-400`}
          role="status"
          aria-label={label ?? "Loading"}
        />
      </div>
      {label && (
        <span className="text-xs font-medium tracking-wide text-gray-500 dark:text-gray-400">
          {label}
        </span>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}
