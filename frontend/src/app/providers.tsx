"use client";
import { useState } from "react";
import { UserContext } from "./context";

export function Providers({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState("1");
  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
}
