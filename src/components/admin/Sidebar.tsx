import {
  FolderTree,
  LayoutDashboard,
  LogOut,
  Package,
  ReceiptText,
  RotateCcw,
  Settings,
  ShoppingCart,
  Users,
  WalletCards,
} from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

import NavItem from "./NavItem";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

const Sidebar = ({ mobile = false, onNavigate }: SidebarProps) => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onNavigate?.();
  };

  return (
    <aside
      className={[
        "flex h-full min-h-0 w-64 shrink-0 flex-col",
        "border-r bg-background",
        mobile ? "" : "hidden lg:flex",
      ].join(" ")}
    >
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Smoothshine</h1>

          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 scrollbar-none">
        {/* Overview */}
        <div className="mb-6">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Overview
          </p>

          <div className="space-y-1">
            <NavItem
              label="Dashboard"
              href="/admin"
              icon={LayoutDashboard}
              onClick={onNavigate}
            />
          </div>
        </div>

        {/* Catalog */}
        <div className="mb-6">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Catalog
          </p>

          <div className="space-y-1">
            <NavItem
              label="Products"
              href="/admin/products"
              icon={Package}
              onClick={onNavigate}
            />

            <NavItem
              label="Categories"
              href="/admin/categories"
              icon={FolderTree}
              onClick={onNavigate}
            />
          </div>
        </div>

        {/* Sales */}
        <div className="mb-6">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Sales
          </p>

          <div className="space-y-1">
            <NavItem
              label="Orders"
              href="/admin/orders"
              icon={ShoppingCart}
              onClick={onNavigate}
            />

            <NavItem
              label="Payments"
              href="/admin/payments"
              icon={WalletCards}
              onClick={onNavigate}
            />
          </div>
        </div>

        {/* Customers */}
        <div className="mb-6">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Customers
          </p>

          <div className="space-y-1">
            <NavItem
              label="Users"
              href="/admin/users"
              icon={Users}
              onClick={onNavigate}
            />
          </div>
        </div>

        {/* After Sales */}
        <div className="mb-6">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            After Sales
          </p>

          <div className="space-y-1">
            <NavItem
              label="Returns"
              href="/admin/returns"
              icon={RotateCcw}
              onClick={onNavigate}
            />

            <NavItem
              label="Refunds"
              href="/admin/refunds"
              icon={ReceiptText}
              onClick={onNavigate}
            />
          </div>
        </div>

        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            System
          </p>

          <NavItem
            label="Settings"
            href="/admin/settings"
            icon={Settings}
            onClick={onNavigate}
          />
        </div>
      </nav>

      <Separator />

      {/* Logout */}
      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
