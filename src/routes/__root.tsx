import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts, type ErrorComponentProps } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { TopNav } from "@/components/TopNav";
import { Toaster } from "@/components/ui/sonner";
import { themeInitScript } from "@/lib/theme";

function NotFoundComponent() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-2 text-4xl">Page not found</h1>
      <Link to="/" className="btn mt-6">Go home</Link>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl">This page didn't load</h1>
      <button className="btn mt-6" onClick={() => { router.invalidate(); reset(); }}>Try again</button>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Core Systems — Interactive OS & Computer Networks" },
      { name: "description", content: "Interactive lessons and labs for Operating Systems and Computer Networks, built for interview-depth understanding." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
    scripts: [{ children: themeInitScript }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <TopNav />
      <main className="min-h-[80vh]"><Outlet /></main>
      <footer className="rule-t mx-auto mt-20 max-w-6xl px-5 py-8 font-mono text-xs text-muted-foreground">
        Understand the system. Experiment with it. Explain it. Defend the trade-off.
      </footer>
      <Toaster />
    </QueryClientProvider>
  );
}