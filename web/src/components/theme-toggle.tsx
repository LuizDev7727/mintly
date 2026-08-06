import { useCallback, useRef } from "react";
import { flushSync } from "react-dom";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Toggle } from "./ui/toggle";

const TRANSITION_DURATION = 400;

// All coordinates are percentages of the snapshot reference box: Chrome renders
// absolute px clip-path coordinates on ::view-transition-new(root) unscaled on
// fractional display scales for the first transition after load, so px values
// can land at the wrong position.
function getCircleClipPaths(
  cx: number,
  cy: number,
  maxRadius: number,
  viewportWidth: number,
  viewportHeight: number,
): [string, string] {
  const toX = (x: number) => `${(x / viewportWidth) * 100}%`;
  const toY = (y: number) => `${(y / viewportHeight) * 100}%`;
  const point = (x: number, y: number) => `${toX(x)} ${toY(y)}`;
  // circle() percentage radii resolve against hypot(w, h) / sqrt(2) of the reference box.
  const toRadius = (r: number) =>
    `${(r / (Math.hypot(viewportWidth, viewportHeight) / Math.SQRT2)) * 100}%`;

  return [
    `circle(0% at ${point(cx, cy)})`,
    `circle(${toRadius(maxRadius)} at ${point(cx, cy)})`,
  ];
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isTransitioningRef = useRef(false);

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const handleThemeToggle = useCallback(() => {
    const button = buttonRef.current;

    if (
      !button ||
      isTransitioningRef.current ||
      document.documentElement.dataset.themeVt === "active"
    ) {
      return;
    }

    const nextTheme = theme === "light" ? "dark" : "light";

    if (typeof document.startViewTransition !== "function") {
      setTheme(nextTheme);
      return;
    }

    // innerWidth/innerHeight (not visualViewport): percentages must resolve
    // against the snapshot reference box, which includes classic scrollbars.
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const { top, left, width, height } = button.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;

    const maxRadius = Math.hypot(
      Math.max(x, viewportWidth - x),
      Math.max(y, viewportHeight - y),
    );

    const clipPath = getCircleClipPaths(
      x,
      y,
      maxRadius,
      viewportWidth,
      viewportHeight,
    );

    const root = document.documentElement;
    root.dataset.themeVt = "active";
    root.style.setProperty(
      "--theme-toggle-vt-duration",
      `${TRANSITION_DURATION}ms`,
    );
    // Pin the collapsed clip-path via CSS so the browser doesn't paint the
    // new theme unclipped between snapshot and the ready.then() JS animation.
    root.style.setProperty("--theme-vt-clip-from", clipPath[0]);

    const cleanup = () => {
      isTransitioningRef.current = false;
      delete root.dataset.themeVt;
      root.style.removeProperty("--theme-toggle-vt-duration");
      root.style.removeProperty("--theme-vt-clip-from");
    };

    isTransitioningRef.current = true;
    const transition = document.startViewTransition(() => {
      flushSync(() => setTheme(nextTheme));
    });

    transition?.finished?.finally(cleanup).catch(() => {});

    transition?.ready
      ?.then(() => {
        document.documentElement.animate(
          { clipPath },
          {
            duration: TRANSITION_DURATION,
            easing: "ease-in-out",
            fill: "forwards",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      .catch(() => {});
  }, [theme, setTheme]);

  return (
    <Toggle
      ref={buttonRef}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="group cursor-pointer size-8 rounded-full border-none text-muted-foreground shadow-none data-[state=on]:bg-transparent data-[state=on]:text-muted-foreground data-[state=on]:hover:bg-muted data-[state=on]:hover:text-foreground"
      onPressedChange={handleThemeToggle}
      pressed={isDark}
      variant="outline"
    >
      {/* Note: After dark mode implementation, rely on dark: prefix rather than group-data-[state=on]: */}
      <MoonIcon
        aria-hidden="true"
        className="shrink-0 scale-0 opacity-0 transition-all group-data-[state=on]:scale-100 group-data-[state=on]:opacity-100"
        size={16}
      />
      <SunIcon
        aria-hidden="true"
        className="absolute shrink-0 scale-100 opacity-100 transition-all group-data-[state=on]:scale-0 group-data-[state=on]:opacity-0"
        size={16}
      />
    </Toggle>
  );
}
