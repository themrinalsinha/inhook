import { useEffect } from "react";
import { Container } from "../Container";
import { NavBar } from "./NavBar";
import { HookEndpoint } from "./HookEndpoint";
import { cn } from "@/libs/util";

export const Dashboard = () => {
  useEffect(() => {
    document.title = "InHook - Dashboard";
  }, []);

  return (
    <Container className="h-screen mx-auto bg-neutral-50/50 p-5">
      <NavBar />
      <Container className={cn(
        "max-w-7xl mx-auto bg-white outline-1 outline-neutral-200",
        "divide-y divide-neutral-200"
      )}>
        <HookEndpoint />

      </Container>
    </Container>
  );
};
