import { createContext, useContext, useState } from "react";

type ViewMode = "grid" | "list";

type ViewModeProviderProps = {
  children: React.ReactNode;
  defaultView?: ViewMode;
};

type ViewModeContextState = {
  view: ViewMode;
  setView: (view: ViewMode) => void;
};

const initialState: ViewModeContextState = {
  view: "grid",
  setView: () => null,
};

const ViewModeContext = createContext<ViewModeContextState>(initialState);

export function ViewModeProvider({
  children,
  defaultView = "grid",
  ...props
}: ViewModeProviderProps) {
  const [view, setView] = useState<ViewMode>(defaultView);

  const value = {
    view,
    setView,
  };

  return (
    <ViewModeContext.Provider {...props} value={value}>
      {children}
    </ViewModeContext.Provider>
  );
}

export const useViewMode = () => {
  const context = useContext(ViewModeContext);

  if (context === undefined)
    throw new Error("useViewMode must be used within a ViewModeProvider");

  return context;
};
