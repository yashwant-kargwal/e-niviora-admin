import { useEffect, useState } from "react";

import {
  UserRound,
  Mail,
  Phone,
  ShieldCheck,
  Save,
  Loader2,
} from "lucide-react";

import { useMe, useUpdateMe } from "@/hooks/useUsers";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

const AdminProfile = () => {
  const { data: user, isLoading } = useMe();

  const updateMe = useUpdateMe();

  const [name, setName] = useState("");

  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!user) return;

    setName(user.name);
    setPhone(user.phone ?? "");
  }, [user]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Name is required.");
      return;
    }

    try {
      await updateMe.mutateAsync({
        name: name.trim(),
        phone: phone.trim() || undefined,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 pb-10">
      <div>
        <div className="flex items-center gap-2">
          <UserRound className="size-6" />

          <h1 className="text-2xl font-bold">My Profile</h1>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your administrator profile.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck className="size-7 text-primary" />
            </div>

            <div>
              <CardTitle>Administrator Account</CardTitle>

              <CardDescription>
                Only your name and phone number can be updated here.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Name */}

          <div className="space-y-2">
            <Label>Name</Label>

            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          {/* Email READ ONLY */}

          <div className="space-y-2">
            <Label>Email</Label>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input value={user.email} disabled className="pl-9" />
            </div>

            <p className="text-xs text-muted-foreground">
              Email cannot be changed from the admin panel.
            </p>
          </div>

          {/* Phone */}

          <div className="space-y-2">
            <Label>Phone</Label>

            <div className="relative">
              <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="pl-9"
                placeholder="10 digit phone number"
              />
            </div>
          </div>

          {/* Role */}

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Account Role</p>

              <p className="text-sm text-muted-foreground">
                Your role cannot be changed from this screen.
              </p>
            </div>

            <Badge>ADMIN</Badge>
          </div>

          {/* Save */}

          <div className="flex justify-end border-t pt-5">
            <Button onClick={handleSubmit} disabled={updateMe.isPending}>
              {updateMe.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 size-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProfile;
