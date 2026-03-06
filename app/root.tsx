import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
  useRouteError,
} from "react-router";
import type { MetaFunction } from "react-router";
import { DarkModeProvider, useDarkMode } from "./context/dark-mode";
import "./index.css";

export const meta: MetaFunction = () => [
  { title: "Camber AI — AI-Powered Product Image Transformation" },
  {
    name: "description",
    content:
      "Transform your product photography with AI. Show customers what your products look like lit up, switched on, or in use.",
  },
  { property: "og:title", content: "Camber AI — AI-Powered Product Image Transformation" },
  { property: "og:description", content: "Transform your product photography with AI." },
  { property: "og:type", content: "website" },
  { name: "twitter:card", content: "summary_large_image" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=localStorage.getItem("theme");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme:dark)").matches;if(d)document.documentElement.classList.add("dark");requestAnimationFrame(function(){document.documentElement.classList.add("theme-resolved")})})()`,
          }}
        />
      </head>
      <body className="m-0 min-h-screen">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function NavigationProgressBar() {
  const navigation = useNavigation();
  const isNavigating = navigation.state !== "idle";

  return (
    <div
      className={`fixed inset-x-0 top-0 z-50 h-0.5 transition-opacity duration-200 ${
        isNavigating ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="h-full animate-progress bg-ikea-blue dark:bg-amber-glow" />
    </div>
  );
}

function AmberFlashOverlay() {
  const { showFlash } = useDarkMode();
  if (!showFlash) return null;
  return (
    <div
      className="amber-flash pointer-events-none fixed inset-0 z-50"
      style={{ backgroundColor: "#F59E0B" }}
      aria-hidden="true"
    />
  );
}

export default function App() {
  return (
    <DarkModeProvider>
      <NavigationProgressBar />
      <AmberFlashOverlay />
      <Outlet />
    </DarkModeProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const is404 = isRouteErrorResponse(error) && error.status === 404;
  const status = is404 ? 404 : 500;
  const title = is404 ? "Page not found" : "Something went wrong";
  const message = is404
    ? "The page you're looking for doesn't exist or has been moved."
    : "An unexpected error occurred. Please try again.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-light dark:bg-surface-dark">
      <div className="px-4 text-center">
        <p className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
          Error {status}
        </p>
        <h1 className="mt-2 font-display text-4xl italic text-[#1C1917] dark:text-[#F5F0E8]">
          {title}
        </h1>
        <p className="mt-3 text-sm text-[#78716C] dark:text-[#A8A097]">
          {message}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg border border-border-light px-4 py-2.5 text-sm font-medium text-[#1C1917] transition-colors hover:bg-[#F5F0E8] dark:border-border-dark dark:text-[#F5F0E8] dark:hover:bg-[#292524]"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-lg bg-ikea-blue px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-amber-glow dark:text-[#1C1917]"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
