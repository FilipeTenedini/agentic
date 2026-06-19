import { NavLink } from "react-router-dom";

import { Logo } from "@/components/shared/logo";
import { NAV_ITEMS } from "@/components/shared/nav-items";
import { useSettings } from "@/contexts/settings-context";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  onNavigate?: () => void;
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const { settings } = useSettings();

  const items = NAV_ITEMS.filter(
    (item) => !item.requiresPersonalUse || settings.personalUse.enabled
  );

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  "hover:bg-sidebar-accent hover:text-foreground",
                  isActive
                    ? "bg-sidebar-accent text-foreground"
                    : "text-sidebar-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "absolute left-0 h-5 w-1 rounded-r-full bg-primary transition-opacity",
                      isActive ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <p className="px-3 text-xs text-muted-foreground">
          FlowAssist · versão demo
        </p>
      </div>
    </div>
  );
}
