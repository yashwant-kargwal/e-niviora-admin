import { useState } from "react";
import { Outlet } from "react-router-dom";

import { Sheet, SheetContent } from "@/components/ui/sheet";

import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";

const AdminLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-muted/30">
      <div className="flex h-full min-h-0">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Area */}
        <div className="flex min-w-0 min-h-0 flex-1 flex-col">
          {/* Main screen scroll container */}
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
            {/* Topbar scrolls with main content */}
            <Topbar onMenuClick={() => setMobileSidebarOpen(true)} />

            {/* Page Content */}
            <main className="p-4 sm:p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <Sidebar mobile onNavigate={() => setMobileSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminLayout;
