import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

interface NavItemProps {
  label: string;
  href: string;
  icon: LucideIcon;
  onClick?: () => void;
}

const NavItem = ({ label, href, icon: Icon, onClick }: NavItemProps) => {
  return (
    <NavLink
      to={href}
      end={href === "/admin"}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 rounded-lg px-3 py-2.5",
          "text-sm font-medium transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          isActive
            ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
            : "text-muted-foreground",
        ].join(" ")
      }
    >
      <Icon className="size-4 shrink-0" />

      <span>{label}</span>
    </NavLink>
  );
};

export default NavItem;
