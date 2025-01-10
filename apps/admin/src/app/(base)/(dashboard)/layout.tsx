import DashboardHeader from "@/modules/base/components/dashboard/header/Header";
import { AppSidebar } from "@/modules/base/components/sidebar/AppSidebar";

import { SidebarInset, SidebarProvider } from "@repo/ui/components/sidebar";

export default async function DashboardLayout({
  children,
  HeaderComponent,
  SidebarComponent,
  MainComponent,
}: {
  children: React.ReactNode;
  HeaderComponent?: React.ReactElement;
  SidebarComponent?: React.ReactElement;
  MainComponent?: React.ReactElement;
}) {
  return (
    <SidebarProvider>
      <div className="mx-auto grid h-svh max-h-svh w-full max-w-screen-2xl grid-rows-[60px_1fr] border-x lg:grid-rows-[60px_1fr]">
        {HeaderComponent === undefined ? <DashboardHeader /> : HeaderComponent}
        <div className="grid w-full auto-cols-[minmax(0px,auto)_minmax(0px,1fr)] grid-flow-col overflow-y-hidden">
          {SidebarComponent === undefined ? (
            <div className="relative inset-0 m-0 h-full p-0">
              <AppSidebar className="absolute h-full border-r" />
            </div>
          ) : (
            SidebarComponent
          )}
          {MainComponent === undefined ? (
            <SidebarInset className="min-h-full overflow-y-hidden">
              {children}
            </SidebarInset>
          ) : (
            MainComponent
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}
