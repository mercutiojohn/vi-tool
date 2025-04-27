import { 
  SidebarProvider,
  // SidebarTrigger
} from "@/components/ui/sidebar"
// import { AppSidebar } from "@/components/app-sidebar"
import { Outlet } from "react-router";

export default function Layout() {
  return (
    <SidebarProvider>
      {/* <AppSidebar /> */}
      <main className="flex flex-col w-full h-full">
        {/* <SidebarTrigger /> */}
        <Outlet />
      </main>
    </SidebarProvider>
  )
}
