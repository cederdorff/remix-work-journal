import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import stylesheet from "~/tailwind.css";

export const links = () => [{ rel: "stylesheet", href: stylesheet }];

export const meta = () => [
  {
    charset: "utf-8",
    title: "Work Journal - RACE",
    viewport: "width=device-width,initial-scale=1",
  },
];
export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="dark:bg-gray-900">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
