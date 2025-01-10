import type { Metadata } from "next";
import { Inter } from "next/font/google";
import QueryClientProvider from "@/modules/base/components/providers/QueryClientProvider";

import "../globals.css";

import { ThemeProvider } from "@/modules/base/components/providers/ThemeProvider";

import { Toaster } from "@repo/ui/components/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Cloudflare Turbo App",
  description: "",
};

export default function BaseRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head></head>
      <body className={inter.className}>
        <QueryClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </QueryClientProvider>
        <Toaster
          toastOptions={{
            classNames: {
              info: "bg-primary",
              error: "bg-destructive",
              success: "bg-success",
              warning: "bg-warning",
              loading: "bg-primary",
            },
          }}
        />
      </body>
    </html>
  );
}
