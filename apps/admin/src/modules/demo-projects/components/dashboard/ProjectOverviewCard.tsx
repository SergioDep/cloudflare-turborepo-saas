import Link from "next/link";

import { Badge, BadgeProps } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";

export function ProjectOverviewCard({
  id,
  title,
  description,
  status,
  badgeVariant,
}: {
  id: string;
  title: string;
  description: string;
  status: string;
  badgeVariant: BadgeProps["variant"];
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          <Badge variant={badgeVariant}>{status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter>
        <Button
          asChild
          type="button"
          variant="ghost"
          className="w-full justify-start text-primary-600 hover:bg-primary-50 hover:text-primary-800"
        >
          <Link href={`/projects/${id}`}>View Project</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
