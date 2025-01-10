import {
  LucideBookOpenText,
  LucideChartNoAxesCombined,
  LucideCloudUpload,
  LucideFolder,
  LucideHome,
  LucideUserCog2,
} from "lucide-react";

import {
  ExtractRecursiveIds,
  FindRecursivePropValue,
} from "@repo/validators/modules/base/utils";

export type BaseSidebarItem<F = any> = {
  id: string;
  items?: (BaseSidebarItem<F> & {
    content?: {
      accessControl?: (filters: F) => boolean | Promise<boolean>;
      render: string | ((...args: any[]) => JSX.Element);
      redirect?: string;
      icon?: React.ReactNode;
    };
  })[];
};

export const sidebarDefinitions = {
  default: {
    id: "default",
    items: [
      {
        id: "home",
        content: {
          render: () => (
            <div className="flex w-full items-center justify-between rounded-md px-4 py-2">
              <div className="flex items-center gap-3">
                <LucideHome className="h-5 w-5" />
                <span className="font-semibold tracking-wide">Home</span>
              </div>
            </div>
          ),
          redirect: "/",
        },
      },
    ],
  },
  projects: {
    id: "projects",
    items: [
      {
        id: "projects",
        content: {
          render: () => (
            <div className="flex w-full items-center justify-between rounded-md px-4 py-2">
              <div className="flex items-center gap-3">
                <LucideFolder className="h-5 w-5" />
                <span className="font-semibold tracking-wide">Projects</span>
              </div>
            </div>
          ),
          redirect: "/projects",
        },
      },
    ],
  },
  crm: {
    id: "crm",
    items: [
      {
        id: "crm",
        content: {
          render: () => (
            <div className="flex w-full items-center justify-between rounded-md px-4 py-2">
              <div className="flex items-center gap-3">
                <LucideBookOpenText className="h-5 w-5" />
                <span className="font-semibold tracking-wide">CRM</span>
              </div>
            </div>
          ),
        },
        items: [
          {
            id: "contacts",
            content: {
              render: () => (
                <div className="flex w-full items-center justify-between rounded-md px-4 py-2">
                  <div className="flex items-center gap-3">
                    <LucideUserCog2 className="h-5 w-5" />
                    <span className="font-semibold tracking-wide">
                      Contacts
                    </span>
                  </div>
                </div>
              ),
              redirect: "/crm/contacts",
            },
          },
          {
            id: "sync-data",
            content: {
              render: () => (
                <div className="flex w-full items-center justify-between rounded-md px-4 py-2">
                  <div className="flex items-center gap-3">
                    <LucideCloudUpload className="h-5 w-5" />
                    <span className="font-semibold tracking-wide">
                      Sync Data
                    </span>
                  </div>
                </div>
              ),
              redirect: "/crm/sync-data",
            },
          },
        ],
      },
    ],
  },
  analytics: {
    id: "analytics",
    items: [
      {
        id: "analytics",
        content: {
          render: () => (
            <div className="flex w-full items-center justify-between rounded-md px-4 py-2">
              <div className="flex items-center gap-3">
                <LucideChartNoAxesCombined className="h-5 w-5" />
                <span className="font-semibold tracking-wide">Analytics</span>
              </div>
            </div>
          ),
          redirect: "/analytics",
        },
      },
    ],
  },
} as const satisfies Record<string, BaseSidebarItem>;

export type SidebarDefinitions = typeof sidebarDefinitions;
export type SidebarItem<T extends AllSidebarTypes = AllSidebarTypes> = {
  [K in AllSidebarTypes]: {
    id: K;
    content: FindRecursivePropValue<
      SidebarDefinitions[keyof SidebarDefinitions],
      K,
      "content"
    >;
    items: FindRecursivePropValue<
      SidebarDefinitions[keyof SidebarDefinitions],
      K,
      "items"
    >;
  };
}[T];

type AllSidebarTypes = ExtractRecursiveIds<SidebarDefinitions, "content">;

type SidebarDefinitionsTag = keyof SidebarDefinitions;
// -------------------- Sidebar Route Configuration --------------------

const sidebarRouteConfig = {
  "/": {
    pattern: /^\//,
    tags: ["default", "projects", "analytics", "crm"],
  },
  "/settings": {
    pattern: /^\/settings/,
    tags: ["default"],
  },
  // Add more route configurations here
} as const satisfies {
  [Route in `/${string}`]: {
    pattern: RegExp;
    tags: SidebarDefinitionsTag[];
  };
};

type SidebarConfig = typeof sidebarRouteConfig;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

type ExtractAccessControlParams<
  T extends {
    id: string;
  },
> = T extends {
  content: {
    accessControl: (filters: infer F) => any;
  };
}
  ? { [K in T["id"]]: F }
  : { [K in T["id"]]?: undefined };

type ExtractAccessControlParamsFromItem<T extends { id: string }> =
  ExtractAccessControlParams<T> &
    (T extends { items: infer C }
      ? C extends BaseSidebarItem<any>[]
        ? ExtractAccessControlParamsFromArray<C>
        : {}
      : {});
type ExtractAccessControlParamsFromArray<T extends BaseSidebarItem<any>[]> =
  UnionToIntersection<ExtractAccessControlParamsFromItem<T[number]>>;
type AccessControlParamsByRoute<Route extends keyof SidebarConfig> =
  ExtractAccessControlParamsFromArray<GetItemsForRoute<Route>>;

type GetItemsForRoute<Route extends keyof SidebarConfig> =
  SidebarConfig[Route]["tags"] extends (infer Tag)[]
    ? Tag extends keyof SidebarDefinitions
      ? SidebarDefinitions[Tag]["items"]
      : never
    : never;

// -------------------- Route Matching Function --------------------

// This function finds the matching route configuration based on exact match or pattern.
export function findMatchingConfigRoute(
  route: string,
): keyof SidebarConfig | null {
  // Check for exact match first
  if (route in sidebarRouteConfig) {
    const key = route as keyof SidebarConfig;
    return key;
  }

  // If no exact match, check against patterns
  for (const [key, config] of Object.entries(sidebarRouteConfig)) {
    if (config.pattern.test(route)) {
      return key as keyof SidebarConfig;
    }
  }

  // No match found
  return null;
}

// -------------------- getSidebarConfig Function --------------------

// The main function to retrieve sidebar configuration based on the route and params.
export async function getSidebarConfig<
  Route extends keyof SidebarConfig,
  Params extends AccessControlParamsByRoute<Route>,
>(route: Route, params: Params) {
  const matchingRoute = findMatchingConfigRoute(route);

  let tags: SidebarDefinitionsTag[] = [];

  if (matchingRoute) {
    tags = sidebarRouteConfig[matchingRoute].tags;
  } else {
    // Fallback to default tags if no matching config is found
    tags = ["default"];
  }

  let items: BaseSidebarItem[] = [];

  // Collect all items for the given route tags
  for (const tag of tags) {
    const tagItems = sidebarDefinitions[tag].items;
    if (tagItems) {
      items = items.concat(tagItems);
    }
  }

  // Determine if params are provided and not empty
  const hasParams = params && Object.keys(params).length > 0;
  const effectiveParams = hasParams ? params : {};

  // Filter items based on access control
  const filteredItems = await filterSidebarItems(
    items as SidebarItem[],
    effectiveParams,
  );

  return filteredItems;
}

// -------------------- filterSidebarItems Function --------------------

// This function recursively filters sidebar items based on access control.
async function filterSidebarItems<
  Items extends SidebarItem[],
  Params extends { [key: string]: any },
>(items: Items, params: Params): Promise<Items> {
  const result: SidebarItem[] = [];

  for (const item of items) {
    const id = item.id;

    let hasAccess = true;

    const itemContent =
      "content" in item ? (item as SidebarItem).content : undefined;

    const accessControl =
      itemContent && "accessControl" in itemContent
        ? itemContent.accessControl
        : undefined;
    if (typeof accessControl === "function") {
      const accessParams = params[id];
      if (!accessParams) {
        // If params for this item are not provided, we assume the user has no access
        hasAccess = false;
      } else {
        hasAccess = await Promise.resolve(accessControl(accessParams));
      }
    }

    if (hasAccess) {
      const newItem = { ...item };
      if ("items" in item && item.items) {
        (newItem as BaseSidebarItem<any>).items = await filterSidebarItems(
          item.items as unknown as SidebarItem[],
          params,
        );
      }
      result.push(newItem);
    }
  }

  return result as Items;
}
