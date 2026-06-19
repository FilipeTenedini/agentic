import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/auth-context";
import { SettingsProvider } from "@/contexts/settings-context";
import { KnowledgeBaseProvider } from "@/contexts/knowledge-base-context";
import { ChatProvider } from "@/contexts/chat-context";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="flowassist_theme">
      <AuthProvider>
        <SettingsProvider>
          <KnowledgeBaseProvider>
            <ChatProvider>
              <TooltipProvider delayDuration={200}>
                {children}
                <Toaster />
              </TooltipProvider>
            </ChatProvider>
          </KnowledgeBaseProvider>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
