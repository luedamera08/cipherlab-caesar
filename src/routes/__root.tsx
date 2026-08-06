import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { registerSW } from "virtual:pwa-register";
import { useEffect, type ReactNode } from "react";

import appCss from "~/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CipherLab — Caesar Cipher" },
      {
        name: "description",
        content:
          "An interactive educational tool for learning about the Caesar Cipher and classical cryptography.",
      },
      { name: "theme-color", content: "#0B1020" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon-180x180.png" },
    ],
  }),
  notFoundComponent: () => <div>Page not found</div>,
  component: RootComponent,
});

function RootComponent() {
  useEffect(() => {
    registerSW({ immediate: true });
  }, []);

  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-[#0a0e1a]">
      <head>
        <HeadContent />
      </head>
      <body className="bg-[#0a0e1a] text-white antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}