import { createContext, useContext, useState } from "react";

type ViewMode = "grid" | "list";

const VIEW_MODE_STORAGE_KEY = "view-mode";

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

function getStoredView(defaultView: ViewMode): ViewMode {
  const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
  return stored === "grid" || stored === "list" ? stored : defaultView;
}

export function ViewModeProvider({
  children,
  defaultView = "grid",
  ...props
}: ViewModeProviderProps) {
  const [view, setViewState] = useState<ViewMode>(() =>
    getStoredView(defaultView),
  );

  function setView(nextView: ViewMode) {
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, nextView);
    setViewState(nextView);
  }

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
