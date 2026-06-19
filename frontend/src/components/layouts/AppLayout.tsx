import { Navigate, Outlet, useLocation } from "react-router-dom";

import { AppHeader } from "@/components/shared/app-header";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { NAV_ITEMS } from "@/components/shared/nav-items";
import { useAuth } from "@/contexts/auth-context";
import { ROUTES } from "@/lib/constants";

function usePageTitle(): string {
  const { pathname } = useLocation();
  const match = NAV_ITEMS.find((item) => pathname.startsWith(item.to));
  return match?.label ?? "FlowAssist";
}

export function AppLayout() {
  const { isAuthenticated } = useAuth();
  const title = usePageTitle();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="hidden w-64 shrink-0 border-r lg:block">
        <AppSidebar />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader title={title} />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
