import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAuth } from "@/hooks/useAuth";

interface TopbarProps {
  onMenuClick: () => void;
}

const Topbar = ({ onMenuClick }: TopbarProps) => {
  const { user, logout } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return "A";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur lg:px-6">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile menu */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="size-5" />
          <span className="sr-only">Open menu</span>
        </Button>

        <div className="hidden sm:block">
          <p className="text-sm font-medium">Admin Dashboard</p>

          <p className="text-xs text-muted-foreground">Manage your store</p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" className="h-auto gap-2 px-2 py-1.5">
              <Avatar className="size-8">
                <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
              </Avatar>

              <div className="hidden text-left md:block">
                <p className="text-sm font-medium">{user?.name ?? "Admin"}</p>

                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.name}</p>

              <p className="truncate text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                window.location.href = "/admin/settings";
              }}
            >
              Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={logout}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Topbar;
