import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import { ClerkTokenBridge } from "./lib/clerk/clerkBridge";
import App from "./App";
import "./index.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  // ponytail: fail fast in dev so the missing env is obvious
  throw new Error("VITE_CLERK_PUBLISHABLE_KEY is required");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} signInUrl="/login"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/">
      <ClerkTokenBridge />
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </ClerkProvider>
  </StrictMode>,
);
