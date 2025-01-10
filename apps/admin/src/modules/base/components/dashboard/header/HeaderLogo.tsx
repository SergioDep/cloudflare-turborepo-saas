"use client";

import React from "react";
import Link from "next/link";
import MyLogo from "@/modules/base/components/icons/MyLogo";

import { cn } from "@repo/ui/lib/utils";

const HeaderLogo = React.forwardRef<
  React.ElementRef<typeof Link>,
  React.ComponentPropsWithoutRef<typeof Link> & {}
>(({ href, className, children, ...props }, ref) => {
  return (
    <Link
      ref={ref}
      href={href}
      className={cn(
        "flex items-start justify-start gap-2 truncate font-semibold",
        className,
      )}
      {...props}
    >
      <MyLogo className="h-6 w-6" />
      <span className="truncate">My Cloudflare Turbo App</span>
      {children}
    </Link>
  );
});
HeaderLogo.displayName = "HeaderLogo";

export default HeaderLogo;
