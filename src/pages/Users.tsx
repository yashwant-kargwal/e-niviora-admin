import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Users as UsersIcon,
  UserPlus,
  ShieldCheck,
  UserRound,
  ChevronLeft,
  ChevronRight,
  X,
  Mail,
  Phone,
  Loader2,
} from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { authService } from "@/services/auth.service";
import type { UserRole } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getMutationErrorMessage, toast } from "@/components/ui/toast-store";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Users = () => {
  const navigate = useNavigate();

  // =====================================================
  // FILTERS
  // =====================================================

  const [activeTab, setActiveTab] = useState<"all" | "customers" | "admins">(
    "all",
  );

  const [searchInput, setSearchInput] = useState("");

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");

  const [page, setPage] = useState(1);

  const limit = 10;

  // =====================================================
  // CREATE ADMIN MODAL
  // =====================================================

  const [createAdminOpen, setCreateAdminOpen] = useState(false);

  const [adminName, setAdminName] = useState("");

  const [adminEmail, setAdminEmail] = useState("");

  const [adminPhone, setAdminPhone] = useState("");

  const [adminPassword, setAdminPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  // =====================================================
  // SEARCH DEBOUNCE
  // =====================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());

      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // =====================================================
  // ROLE
  // =====================================================

  const role: UserRole | undefined =
    activeTab === "customers"
      ? "CUSTOMER"
      : activeTab === "admins"
        ? "ADMIN"
        : undefined;

  // =====================================================
  // ACTIVE STATUS
  // =====================================================

  const isActive =
    status === "active" ? true : status === "inactive" ? false : undefined;

  // =====================================================
  // API
  // =====================================================

  const { data, isLoading, isFetching, isError, refetch } = useUsers({
    page,
    limit,
    search: search || undefined,
    role,
    isActive,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const users = data?.data ?? [];

  const totalPages = data?.totalPages ?? 1;

  // =====================================================
  // TAB
  // =====================================================

  const handleTabChange = (tab: "all" | "customers" | "admins") => {
    setActiveTab(tab);
    setPage(1);
  };

  // =====================================================
  // RESET
  // =====================================================

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("all");
    setActiveTab("all");
    setPage(1);
  };

  // =====================================================
  // CREATE ADMIN VALIDATION
  // =====================================================

  const handleCreateAdmin = async () => {
    if (!adminName.trim()) {
      alert("Admin name is required.");
      return;
    }

    if (!adminEmail.trim()) {
      alert("Admin email is required.");
      return;
    }

    if (!adminPhone.trim()) {
      alert("Admin phone is required.");
      return;
    }

    if (adminPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    if (adminPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      await authService.signupAdmin({
        name: adminName.trim(),
        email: adminEmail.trim(),
        phone: adminPhone.trim(),
        password: adminPassword,
      });

      setCreateAdminOpen(false);
      setAdminName("");
      setAdminEmail("");
      setAdminPhone("");
      setAdminPassword("");
      setConfirmPassword("");
      refetch();
      toast.success(
        "Admin created",
        "The new administrator was added successfully.",
      );
    } catch (error) {
      console.error("Admin creation failed:", error);
      toast.error("Admin creation failed", getMutationErrorMessage(error));
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (isLoading && !data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Loading users...
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (isError) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Failed to load users</CardTitle>

            <CardDescription>
              Something went wrong while loading users.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button onClick={() => refetch()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <UsersIcon className="size-6" />

              <h1 className="text-2xl font-bold tracking-tight">Users</h1>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              View customers and manage administrator accounts.
            </p>
          </div>

          <Button onClick={() => setCreateAdminOpen(true)}>
            <UserPlus className="mr-2 size-4" />
            Create Admin
          </Button>
        </div>

        {/* ================================================= */}
        {/* TABS */}
        {/* ================================================= */}

        <div className="flex flex-wrap gap-2 border-b pb-3">
          <Button
            variant={activeTab === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleTabChange("all")}
          >
            All
          </Button>

          <Button
            variant={activeTab === "customers" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleTabChange("customers")}
          >
            <UserRound className="mr-2 size-4" />
            Customers
          </Button>

          <Button
            variant={activeTab === "admins" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleTabChange("admins")}
          >
            <ShieldCheck className="mr-2 size-4" />
            Admins
          </Button>
        </div>

        {/* ================================================= */}
        {/* FILTERS */}
        {/* ================================================= */}

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 lg:flex-row">
              {/* Search */}

              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by name, email or phone..."
                  className="pl-9"
                />

                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {/* Status */}

              <Select
                value={status}
                onValueChange={(value) => {
                  setStatus(value as "all" | "active" | "inactive");

                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>

                  <SelectItem value="active">Active</SelectItem>

                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {/* Reset */}

              {(search || status !== "all" || activeTab !== "all") && (
                <Button variant="outline" onClick={resetFilters}>
                  Reset
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ================================================= */}
        {/* TABLE */}
        {/* ================================================= */}

        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {activeTab === "customers"
                    ? "Customers"
                    : activeTab === "admins"
                      ? "Administrators"
                      : "All Users"}
                </CardTitle>

                <CardDescription>
                  {data?.total ?? 0} users found
                </CardDescription>
              </div>

              {isFetching && (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {users.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                  <UsersIcon className="size-6 text-muted-foreground" />
                </div>

                <h3 className="mt-4 font-semibold">No users found</h3>

                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Try changing your search or filters.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop table */}

                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full">
                    <thead className="border-b bg-muted/40">
                      <tr className="text-left text-sm">
                        <th className="px-6 py-4 font-medium">User</th>

                        <th className="px-6 py-4 font-medium">Contact</th>

                        <th className="px-6 py-4 font-medium">Role</th>

                        <th className="px-6 py-4 font-medium">Status</th>

                        <th className="px-6 py-4 font-medium">Joined</th>
                      </tr>
                    </thead>

                    <tbody>
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          onClick={() => navigate(`/admin/users/${user.id}`)}
                          className="cursor-pointer border-b last:border-0 hover:bg-muted/40"
                        >
                          {/* User */}

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                {user.role === "ADMIN" ? (
                                  <ShieldCheck className="size-5 text-primary" />
                                ) : (
                                  <UserRound className="size-5 text-primary" />
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-medium">
                                  {user.name}
                                </p>

                                <p className="truncate text-xs text-muted-foreground">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Contact */}

                          <td className="px-6 py-4">
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <Mail className="size-3.5 text-muted-foreground" />
                                <span>{user.email}</span>
                              </div>

                              {user.phone && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Phone className="size-3.5" />
                                  <span>{user.phone}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Role */}

                          <td className="px-6 py-4">
                            {user.role === "ADMIN" ? (
                              <Badge variant="default">ADMIN</Badge>
                            ) : (
                              <Badge variant="secondary">CUSTOMER</Badge>
                            )}
                          </td>

                          {/* Status */}

                          <td className="px-6 py-4">
                            {user.isActive ? (
                              <Badge
                                variant="outline"
                                className="border-green-500/30 text-green-600"
                              >
                                Active
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="border-destructive/30 text-destructive"
                              >
                                Inactive
                              </Badge>
                            )}
                          </td>

                          {/* Date */}

                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}

                <div className="divide-y md:hidden">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => navigate(`/admin/users/${user.id}`)}
                      className="w-full p-4 text-left hover:bg-muted/40"
                    >
                      <div className="flex gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          {user.role === "ADMIN" ? (
                            <ShieldCheck className="size-5 text-primary" />
                          ) : (
                            <UserRound className="size-5 text-primary" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium">{user.name}</p>

                              <p className="mt-1 text-sm text-muted-foreground">
                                {user.email}
                              </p>
                            </div>

                            {user.role === "ADMIN" ? (
                              <Badge>ADMIN</Badge>
                            ) : (
                              <Badge variant="secondary">CUSTOMER</Badge>
                            )}
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            {user.phone && (
                              <span className="text-xs text-muted-foreground">
                                {user.phone}
                              </span>
                            )}

                            {user.isActive ? (
                              <Badge
                                variant="outline"
                                className="text-green-600"
                              >
                                Active
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-destructive"
                              >
                                Inactive
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* ================================================= */}
        {/* PAGINATION */}
        {/* ================================================= */}

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((current) => current - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((current) => current + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* =================================================== */}
      {/* CREATE ADMIN MODAL */}
      {/* =================================================== */}

      <Dialog open={createAdminOpen} onOpenChange={setCreateAdminOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Administrator</DialogTitle>

            <DialogDescription>
              Create a new administrator account. Customers cannot be modified
              from this panel.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Name */}

            <div className="space-y-2">
              <Label>Name</Label>

              <Input
                value={adminName}
                onChange={(event) => setAdminName(event.target.value)}
                placeholder="Admin name"
              />
            </div>

            {/* Email */}

            <div className="space-y-2">
              <Label>Email</Label>

              <Input
                type="email"
                value={adminEmail}
                onChange={(event) => setAdminEmail(event.target.value)}
                placeholder="admin@E-NIVIORA.com"
              />
            </div>

            {/* Phone */}

            <div className="space-y-2">
              <Label>Phone</Label>

              <Input
                type="tel"
                value={adminPhone}
                onChange={(event) => setAdminPhone(event.target.value)}
                placeholder="9876543210"
              />
            </div>

            {/* Password */}

            <div className="space-y-2">
              <Label>Password</Label>

              <Input
                type="password"
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
                placeholder="Minimum 6 characters"
              />
            </div>

            {/* Confirm */}

            <div className="space-y-2">
              <Label>Confirm Password</Label>

              <Input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat password"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateAdminOpen(false)}>
              Cancel
            </Button>

            <Button onClick={handleCreateAdmin}>
              <UserPlus className="mr-2 size-4" />
              Create Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Users;
