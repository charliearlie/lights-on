import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { DarkModeProvider, useDarkMode } from "./context/dark-mode";
import "./index.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>ILLUMINATE — Nordic Home</title>
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
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
      <AmberFlashOverlay />
      <Outlet />
    </DarkModeProvider>
  );
}

export function ErrorBoundary() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-4xl italic">Something went wrong</h1>
        <a href="/" className="mt-4 inline-block text-ikea-blue underline">
          Go home
        </a>
      </div>
    </div>
  );
}
