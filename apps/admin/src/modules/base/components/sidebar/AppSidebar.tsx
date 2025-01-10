"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HeaderLogo from "@/modules/base/components/dashboard/header/HeaderLogo";
import {
  findMatchingConfigRoute,
  getSidebarConfig,
  SidebarItem,
} from "@/modules/base/lib/config/sidebar-definitions";
import { ChevronRight, CircleX } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@repo/ui/components/sidebar";
import { cn } from "@repo/ui/lib/utils";

export function AppSidebar({
  children,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>([]);

  const { isMobile, toggleSidebar } = useSidebar();

  useEffect(() => {
    const fetchSidebarItems = async () => {
      const configRoute = findMatchingConfigRoute(pathname);
      if (configRoute) {
        const items = await getSidebarConfig(configRoute, {});
        setSidebarItems(items);
      }
    };

    void fetchSidebarItems();
  }, [pathname]);

  return (
    <Sidebar {...props}>
      {isMobile && (
        <div className="relative flex h-[60px] min-h-[60px] w-full items-center justify-center gap-2 border-b px-4 lg:px-6">
          <HeaderLogo
            href="/"
            onClick={() => {
              toggleSidebar();
            }}
          >
            <CircleX className="absolute right-0 h-6 w-6 translate-x-full text-accent-foreground" />
          </HeaderLogo>
        </div>
      )}
      <SidebarContent className="p-4">
        <SidebarMenu>
          {sidebarItems.map((item, index) => (
            <AppSidebarTree item={item} pathname={pathname} />
          ))}
        </SidebarMenu>
      </SidebarContent>
      {children}
      <SidebarRail />
    </Sidebar>
  );
}

const findActiveChildPath = (item: SidebarItem, pathname: string): boolean => {
  const isCurrentItemActive =
    typeof item.content === "object" &&
    "redirect" in item.content &&
    item.content.redirect === pathname;

  if (isCurrentItemActive) {
    return true;
  }

  if (item.items) {
    return item.items.some((subItem) =>
      findActiveChildPath(subItem as SidebarItem, pathname),
    );
  }

  return false;
};

export function AppSidebarTree({
  item,
  pathname,
}: {
  item: SidebarItem;
  pathname: string;
}) {
  const isCollapsed = useMemo(
    () => findActiveChildPath(item, pathname),
    [item, pathname],
  );

  if (!item.items?.length) {
    return (
      <SidebarMenuItem>
        <div className="flex h-12 max-h-12 w-full">
          <AppSidebarItem item={item} />
        </div>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible
      asChild
      defaultOpen={isCollapsed}
      className="group/collapsible relative"
    >
      <SidebarMenuItem>
        <div className="relative flex h-12 max-h-12 w-full">
          <AppSidebarItem item={item}></AppSidebarItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuAction className="absolute !top-0 right-0 m-0 h-12 w-12 p-0 transition-all [&[data-state=open]>svg:first-child]:rotate-90">
              <ChevronRight className="ml-0 transition-transform duration-200" />
              <span className="sr-only">Toggle</span>
            </SidebarMenuAction>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent asChild>
          <SidebarMenuSub className="m-0 ml-3.5 p-0 pl-3.5">
            {item.items?.map((subItem, index) => (
              <AppSidebarTree
                key={index}
                item={subItem as SidebarItem}
                pathname={pathname}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function AppSidebarItem({ item }: { item: SidebarItem }) {
  const { isMobile, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const active =
    "redirect" in item.content && item.content.redirect === pathname;

  return (
    <Link
      className={cn(
        "flex h-full w-full items-center gap-4 overflow-hidden rounded-lg px-3 py-2 text-lg font-medium text-muted-foreground transition-all hover:bg-primary hover:text-accent-foreground",
        {
          "bg-muted text-foreground": active,
        },
      )}
      href={"redirect" in item.content ? item.content?.redirect : "#"}
      onClick={() => {
        if (isMobile) {
          toggleSidebar();
        }
      }}
    >
      {typeof item.content.render === "string"
        ? item.content.render
        : typeof item.content.render === "function" && (
            <item.content.render></item.content.render>
          )}
    </Link>
  );
}
