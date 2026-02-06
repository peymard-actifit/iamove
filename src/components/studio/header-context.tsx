"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface HeaderContextType {
  centerContent: ReactNode;
  setCenterContent: (content: ReactNode) => void;
  rightActions: ReactNode;
  setRightActions: (actions: ReactNode) => void;
}

const HeaderContext = createContext<HeaderContextType | null>(null);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [centerContent, setCenterContent] = useState<ReactNode>(null);
  const [rightActions, setRightActions] = useState<ReactNode>(null);

  return (
    <HeaderContext.Provider value={{ centerContent, setCenterContent, rightActions, setRightActions }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeaderContent() {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error("useHeaderContent must be used within a HeaderProvider");
  }
  return context;
}
