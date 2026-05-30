import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext, useRouter,
  HeadContent, Scripts,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider, useT, LANGUAGES, type Lang } from "@/lib/i18n";
import { Toaster } from "@/components/ui/sonner";
import { Globe } from "lucide-react";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          That calculator doesn't exist (yet).
        </p>
        <Link to="/" className="mt-6 inline-flex rounded-lg gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-elegant">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 inline-flex rounded-lg gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Calcverse — Smart AI Multi Calculator" },
      { name: "description", content: "Beautiful AI-powered multi-calculator: basic, scientific, financial, health, academic, and more." },
      { property: "og:title", content: "Calcverse — Smart AI Multi Calculator" },
      { name: "twitter:title", content: "Calcverse — Smart AI Multi Calculator" },
      { property: "og:description", content: "Beautiful AI-powered multi-calculator: basic, scientific, financial, health, academic, and more." },
      { name: "twitter:description", content: "Beautiful AI-powered multi-calculator: basic, scientific, financial, health, academic, and more." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c45f456b-3401-451c-b2aa-41193f867ba5/id-preview-61e08693--d2e84127-66f2-4c72-98c5-25476ea78826.lovable.app-1780045195895.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c45f456b-3401-451c-b2aa-41193f867ba5/id-preview-61e08693--d2e84127-66f2-4c72-98c5-25476ea78826.lovable.app-1780045195895.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SidebarProvider>
          <div className="min-h-screen flex w-full gradient-soft">
            <AppSidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <header className="sticky top-0 z-30 h-14 flex items-center gap-3 border-b border-border bg-background/95 px-4">
                <SidebarTrigger />
                <div className="text-sm text-muted-foreground hidden sm:block">
                  Smart calculations for everything in life
                </div>
                <div className="ml-auto text-xs text-muted-foreground hidden md:block">
                  10 calculators · AI-enhanced
                </div>
              </header>
              <main className="flex-1 p-4 md:p-8">
                <Outlet />
              </main>
            </div>
          </div>
          <Toaster />
        </SidebarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
