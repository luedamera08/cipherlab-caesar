import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "~/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CipherLab — Caesar Cipher" },
      { name: "description", content: "An interactive educational tool for learning about the Caesar Cipher and classical cryptography." },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  notFoundComponent: () => <div>Page not found</div>,
  component: RootComponent,
});

function RootComponent() {
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
