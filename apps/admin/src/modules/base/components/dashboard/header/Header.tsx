import HeaderLogo from "@/modules/base/components/dashboard/header/HeaderLogo";
import { ModeToggle } from "@/modules/base/components/ui-extended/mode-toggle";
import { LucideSearch } from "lucide-react";

import { Input } from "@repo/ui/components/input";
import { SidebarTrigger } from "@repo/ui/components/sidebar";

export interface DashboardHeaderProps {
  LeftComponent?: React.ReactElement;
  MiddleComponent?: React.ReactElement;
  RightComponent?: React.ReactElement;
}

export default function DashboardHeader({
  LeftComponent,
  MiddleComponent,
  RightComponent,
}: DashboardHeaderProps) {
  return (
    <header className="grid h-[60px] w-full grid-cols-[240px_1fr] items-center border-b bg-background md:grid-cols-[280px_1fr]">
      <div className="flex h-full w-full items-center justify-center gap-2 border-r px-4 lg:px-6">
        {LeftComponent === undefined ? (
          <>
            <SidebarTrigger className="border p-4 shadow-md md:sr-only" />
            <HeaderLogo href="/" />
          </>
        ) : (
          LeftComponent
        )}
      </div>
      <div className="flex w-full items-center justify-end px-4 lg:px-6">
        {MiddleComponent === undefined ? (
          <form className="relative hidden w-full flex-1 items-center pr-4 text-center md:flex lg:pr-6">
            <LucideSearch className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="h-10 w-full appearance-none bg-background pl-8 shadow-none md:w-2/3"
            />
          </form>
        ) : (
          MiddleComponent
        )}
        {RightComponent === undefined ? (
          <div className="flex items-center justify-between gap-4">
            <ModeToggle />
          </div>
        ) : (
          RightComponent
        )}
      </div>
    </header>
  );
}
