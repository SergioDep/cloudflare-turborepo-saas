"use client";

import { AppSidebar as BaseAppSidebar } from "@/modules/base/components/sidebar/AppSidebar";
import { getUsersCountAction } from "@/modules/demo-projects/server/actions/users/get-users-count";
import { useQuery } from "@tanstack/react-query";
import { LucideUser } from "lucide-react";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { SidebarFooter } from "@repo/ui/components/sidebar";

export default function AppSidebar(
  props: React.ComponentProps<typeof BaseAppSidebar>,
) {
  const { data, error, isLoading } = useQuery({
    queryKey: ["users", "count"],
    queryFn: () => getUsersCountAction(),
  });
  return (
    <BaseAppSidebar {...props}>
      <SidebarFooter>
        <Card className="m-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Hello bro 👋
            </CardTitle>
            {isLoading ? (
              <CardDescription className="text-sm text-foreground/60">
                Loading...
              </CardDescription>
            ) : !error ? (
              <CardDescription className="text-sm text-foreground/60">
                Welcome back! You have{" "}
                <span className="font-semibold">{data}</span> users in your
                database.
              </CardDescription>
            ) : null}
          </CardHeader>
          <CardContent className="flex items-center justify-between p-2 md:pt-0">
            <Button
              size="sm"
              className="flex w-full items-center gap-2 hover:bg-primary-500"
              variant="outline"
            >
              <LucideUser className="h-4 w-4 text-foreground/60" />
              View All Users
            </Button>
          </CardContent>
        </Card>
      </SidebarFooter>
    </BaseAppSidebar>
  );
}
