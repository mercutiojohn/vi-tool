import { Home, Settings } from "lucide-react"

import {
  createBrowserRouter
} from "react-router";

import Layout from "./components/layout";
import App from "./App";

export const ROUTER_ITEMS = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        Component: App,
      },
      {
        path: "/settings",
        element: <div>Settings Page</div>,
      }
    ],
  },

]);

export const MENU_ITEMS = [
  {
    title: "Home",
    path: "/",
    icon: Home,
  },
  {
    title: "Settings",
    path: "/settings",
    icon: Settings,
  },
]
