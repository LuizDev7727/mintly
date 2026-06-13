import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center rounded-md bg-transparent border border-muted p-1 gap-1">
      <Button
        variant="ghost"
        size="sm"
        className={`h-7 gap-1.5 px-3 text-sm transition-all ${
          theme === "light"
            ? "bg-background text-foreground shadow-sm hover:bg-background"
            : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={() => setTheme("light")}
      >
        <SunIcon className="size-3.5" />
        Light
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`h-7 gap-1.5 px-3 text-sm transition-all ${
          theme === "dark"
            ? "bg-background text-foreground shadow-sm hover:bg-background"
            : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={() => setTheme("dark")}
      >
        <MoonIcon className="size-3.5" />
        Dark
      </Button>
    </div>
  );
}
