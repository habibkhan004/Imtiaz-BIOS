import type { ReactNode } from "react";
import { TechShell } from "../components/tech/TechShell";

export default function TechLayout({ children }: { children: ReactNode }) {
  return <TechShell>{children}</TechShell>;
}
