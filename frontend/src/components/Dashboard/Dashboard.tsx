import { useEffect } from "react";
import { Container } from "../Container";
import { NavBar } from "./NavBar";
import { HookEndpoint } from "./HookEndpoint";
import { cn } from "@/libs/util";
import { RequestInfo } from "./RequestInfo";

export const Dashboard = () => {
  useEffect(() => {
    document.title = "InHook - Dashboard";
  }, []);

  return (
    <Container className="h-screen mx-auto bg-neutral-50/50 p-5">
      <NavBar />
      <Container
        className={cn(
          "max-w-7xl mx-auto bg-white min-h-[calc(100vh-6rem)]",
          "border-1 border-neutral-200 rounded-b-lg"
        )}
      >
        <HookEndpoint />
        <RequestInfo />
      </Container>
    </Container>
  );
};
