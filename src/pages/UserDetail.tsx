import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  UserRound,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  CreditCard,
  RotateCcw,
  CalendarDays,
  Loader2,
} from "lucide-react";

import { useUser } from "@/hooks/useUsers";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const UserDetail = () => {
  const navigate = useNavigate();

  const { id } = useParams<{
    id: string;
  }>();

  const { data: user, isLoading, isError } = useUser(id);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Loading user...
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>User not found</CardTitle>

            <CardDescription>
              We couldn't load this user's information.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button onClick={() => navigate("/admin/users")}>
              Back to Users
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-10">
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/admin/users")}
        >
          <ArrowLeft className="size-4" />
        </Button>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Details</h1>

          <p className="text-sm text-muted-foreground">
            View account information and activity.
          </p>
        </div>
      </div>

      {/* ================================================= */}
      {/* PROFILE */}
      {/* ================================================= */}

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-primary/10">
              {user.role === "ADMIN" ? (
                <ShieldCheck className="size-9 text-primary" />
              ) : (
                <UserRound className="size-9 text-primary" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold">{user.name}</h2>

                {user.role === "ADMIN" ? (
                  <Badge>ADMIN</Badge>
                ) : (
                  <Badge variant="secondary">CUSTOMER</Badge>
                )}

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
              </div>

              <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================================================= */}
      {/* PERSONAL INFORMATION */}
      {/* ================================================= */}

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>

          <CardDescription>
            Account information is read-only for administrators.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Full Name
              </p>

              <p className="mt-1 font-medium">{user.name}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Email
              </p>

              <div className="mt-1 flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />

                <span>{user.email}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Phone
              </p>

              <div className="mt-1 flex items-center gap-2">
                <Phone className="size-4 text-muted-foreground" />

                <span>{user.phone || "Not provided"}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Role
              </p>

              <p className="mt-1">{user.role}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================================================= */}
      {/* ADDRESS */}
      {/* ================================================= */}

      <Card>
        <CardHeader>
          <CardTitle>Addresses</CardTitle>

          <CardDescription>
            Saved addresses associated with this account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {user.address.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <MapPin className="mx-auto size-7 text-muted-foreground" />

              <p className="mt-2 font-medium">No addresses</p>

              <p className="text-sm text-muted-foreground">
                This user has no saved address.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {user.address.map((address) => (
                <div key={address.id} className="rounded-xl border p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-primary" />

                      <p className="font-semibold">
                        {address.label || "Address"}
                      </p>
                    </div>

                    {address.isDefault && (
                      <Badge variant="secondary">Default</Badge>
                    )}
                  </div>

                  <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                    <p>{address.addressLine1}</p>

                    {address.addressLine2 && <p>{address.addressLine2}</p>}

                    <p>
                      {address.city}, {address.state}
                    </p>

                    <p>
                      {address.pincode}, {address.country}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ================================================= */}
      {/* ACTIVITY */}
      {/* ================================================= */}

      <Card>
        <CardHeader>
          <CardTitle>Account Activity</CardTitle>

          <CardDescription>
            Summary of resources associated with this user.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border p-5">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <ShoppingBag className="size-5 text-primary" />
              </div>

              <p className="mt-4 text-2xl font-bold">{user._count.orders}</p>

              <p className="text-sm text-muted-foreground">Orders</p>
            </div>

            <div className="rounded-xl border p-5">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <CreditCard className="size-5 text-primary" />
              </div>

              <p className="mt-4 text-2xl font-bold">{user._count.payments}</p>

              <p className="text-sm text-muted-foreground">Payments</p>
            </div>

            <div className="rounded-xl border p-5">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <RotateCcw className="size-5 text-primary" />
              </div>

              <p className="mt-4 text-2xl font-bold">
                {user._count.returnRequests}
              </p>

              <p className="text-sm text-muted-foreground">Returns</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================================================= */}
      {/* ACCOUNT DATES */}
      {/* ================================================= */}

      <Card>
        <CardContent className="p-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <CalendarDays className="size-5 text-muted-foreground" />

              <div>
                <p className="text-xs text-muted-foreground">Account Created</p>

                <p className="font-medium">
                  {new Date(user.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CalendarDays className="size-5 text-muted-foreground" />

              <div>
                <p className="text-xs text-muted-foreground">Last Updated</p>

                <p className="font-medium">
                  {new Date(user.updatedAt).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetail;
