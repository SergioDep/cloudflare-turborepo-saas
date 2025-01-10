import { getServerSession } from "@/modules/auth/server/session";
import BaseDashboardHeader from "@/modules/base/components/dashboard/header/Header";
import { ModeToggle } from "@/modules/base/components/ui-extended/mode-toggle";
import DashboardHeaderUser from "@/modules/demo-projects/components/dashboard/header/Avatar";

export default async function DashboardHeader() {
  const session = await getServerSession();
  const user = session?.user;

  return (
    <BaseDashboardHeader
      RightComponent={
        <div className="flex items-center justify-between gap-4">
          <ModeToggle />
          <DashboardHeaderUser user={user} />
        </div>
      }
    ></BaseDashboardHeader>
  );
}
