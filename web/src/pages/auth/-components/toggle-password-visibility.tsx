import { Eye, EyeOff } from "lucide-react";

type TogglePasswordVisibilityProps = {
  isPasswordInputVisible: boolean;
  togglePasswordVisibility: () => void;
};

export function TogglePasswordVisibility({
  isPasswordInputVisible,
  togglePasswordVisibility,
}: TogglePasswordVisibilityProps) {
  return (
    <button
      aria-controls="password"
      aria-label={isPasswordInputVisible ? "Hide password" : "Show password"}
      aria-pressed={isPasswordInputVisible}
      className="absolute cursor-pointer inset-y-0 inset-e-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
      onClick={togglePasswordVisibility}
      type="button"
    >
      {isPasswordInputVisible ? (
        <EyeOff aria-hidden="true" size={16} />
      ) : (
        <Eye aria-hidden="true" size={16} />
      )}
    </button>
  );
}
