import { useEffect } from "react";
import { Container } from "@/components/Container";
import { NavBar } from "@/components/Dashboard/NavBar";
import { HookEndpoint } from "@/components/Dashboard/HookEndpoint";
import { cn } from "@/libs/util";
import { RequestInfo } from "@/components/Dashboard/RequestInfo";

export const Dashboard = () => {
  useEffect(() => {
    document.title = "InHook - Dashboard";
  }, []);

  return (
    <Container className="h-screen mx-auto bg-neutral-100 p-5">
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
