import type { HonoApp } from "@repo/queue-worker/modules/base/lib/factory";

/**
 * RouteConfig represents the configuration for a module's routes.
 * - `prefix`: The URL prefix for the module's routes (e.g., "/crm").
 * - `setup`: A function that takes a Hono instance and sets up the module's routes.
 */
export interface RouteConfig<H extends HonoApp = HonoApp> {
  prefix: string;
  routes: H;
}

const routeConfigs: RouteConfig[] = [];

/**
 * Registers a module's routes to the route registry.
 * @param config The RouteConfig object containing prefix and setup function.
 */
export function registerRoute<H extends HonoApp>(
  config: RouteConfig<H>,
): RouteConfig<H> {
  routeConfigs.push(config);
  return config;
}

/**
 * Retrieves all registered routes.
 */
export function getRegisteredRoutes(): RouteConfig[] {
  return routeConfigs;
}
