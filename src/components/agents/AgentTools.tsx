"use client";

import { useEffect } from "react";
import { registerAgentTools, type ModelContext } from "@/lib/agent-tools";

export default function AgentTools() {
  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContext }).modelContext
      ?? (navigator as Navigator & { modelContext?: ModelContext }).modelContext;
    if (typeof context?.registerTool !== "function") return;
    const registration = registerAgentTools(context, () => location.pathname);
    void registration.ready.catch(() => registration.dispose());
    return registration.dispose;
  }, []);
  return null;
}
