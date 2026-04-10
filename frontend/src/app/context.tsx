"use client";
import { createContext } from "react";

export const UserContext = createContext({
  userId: "1",
  setUserId: (id: string) => {},
});
