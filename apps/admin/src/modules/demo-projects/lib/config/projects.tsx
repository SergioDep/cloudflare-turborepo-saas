// TODO: Remove this file

import {
  LucideChartSpline,
  LucideCookingPot,
  LucideDumbbell,
  LucideGlobe,
  LucideServer,
  LucideShieldCheck,
} from "lucide-react";

export type Tool = {
  id: string;
  name: string;
  description: string;
  status: "Active" | "In Progress" | "Inactive" | "Beta";
  icon: React.ReactNode;
  link: string;
  page?: React.ComponentType; // Bad thing about this is that when using "projects", it will import all the pages, but who cares?
};

export type Project = {
  id: string;
  name: string;
  description: string;
  status: "Active" | "In Progress" | "Inactive";
  tools: Tool[];
};

export const projects: Project[] = [
  {
    id: "alpha",
    name: "Project Alpha",
    description: "A comprehensive deployment management tool.",
    status: "Active",
    tools: [
      {
        id: "deploy-manager",
        name: "Deploy Manager",
        description:
          "Automate and manage your deployment processes seamlessly.",
        status: "Active",
        icon: <LucideServer className="h-6 w-6 text-blue-500" />,
        link: "/tools/deploy-manager",
      },
      {
        id: "license-generator",
        name: "License Generator",
        description: "Create and manage software licenses with ease.",
        status: "Active",
        icon: <LucideShieldCheck className="h-6 w-6 text-green-500" />,
        link: "/tools/license-generator",
      },
    ],
  },
  {
    id: "beta",
    name: "Project Beta",
    description: "An analytics dashboard for real-time metrics.",
    status: "In Progress",
    tools: [
      {
        id: "analytics-dashboard",
        name: "Analytics Dashboard",
        description: "Monitor and analyze your business metrics in real-time.",
        status: "In Progress",
        icon: <LucideChartSpline className="h-6 w-6 text-teal-500" />,
        link: "/tools/analytics-dashboard",
      },
      {
        id: "domain-generator",
        name: "Domain Generator",
        description: "Automatically generate and assign domains effortlessly.",
        status: "In Progress",
        icon: <LucideGlobe className="h-6 w-6 text-red-500" />,
        link: "/tools/domain-generator",
      },
    ],
  },
  {
    id: "gamma",
    name: "Project Gamma",
    description: "A mobile app for tracking fitness metrics.",
    status: "Inactive",
    tools: [
      {
        id: "fitness-tracker",
        name: "Fitness Tracker",
        description: "Track your daily fitness activities and goals.",
        status: "Inactive",
        icon: <LucideDumbbell className="h-6 w-6 text-yellow-500" />,
        link: "/tools/fitness-tracker",
      },
      {
        id: "nutrition-tracker",
        name: "Nutrition Tracker",
        description: "Log and monitor your daily nutritional intake.",
        status: "Inactive",
        icon: <LucideCookingPot className="h-6 w-6 text-orange-500" />,
        link: "/tools/nutrition-tracker",
      },
    ],
  },
];
