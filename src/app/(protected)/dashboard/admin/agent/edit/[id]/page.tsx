/* eslint-disable @typescript-eslint/no-unused-vars */
/*eslint-disable  @typescript-eslint/no-explicit-any*/
"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Jyotishi = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  commissionRate: number;
  bankAccountNumber?: string | null;
  bankIfscCode?: string | null;
  bankAccountHolderName?: string | null;
  panNumber?: string | null;
  isActive: boolean;
};

export default function EditJyotishiPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [jyotishi, setJyotishi] = useState<Jyotishi | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchJyotishi();
    }
  }, [id]);

  const fetchJyotishi = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/jyotishi/${id}`);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch Jyotishi");
      }

      const data = await res.json();
      setJyotishi(data.jyotishi);
    } catch (err: any) {
      console.error("Failed to fetch jyotishi:", err);
      setError(err.message || "Jyotishi not found");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!jyotishi) return;

    // Basic validation
    if (!jyotishi.name.trim()) {
      alert("Name is required");
      return;
    }
    if (!jyotishi.mobile.trim()) {
      alert("Mobile is required");
      return;
    }
    if (jyotishi.commissionRate < 0 || jyotishi.commissionRate > 100) {
      alert("Commission rate must be between 0 and 100");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const res = await fetch(`/api/admin/jyotishi/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: jyotishi.name.trim(),
          mobile: jyotishi.mobile.trim(),
          commissionRate: Number(jyotishi.commissionRate),
          bankAccountNumber: jyotishi.bankAccountNumber?.trim() || null,
          bankIfscCode: jyotishi.bankIfscCode?.trim().toUpperCase() || null,
          bankAccountHolderName: jyotishi.bankAccountHolderName?.trim() || null,
          panNumber: jyotishi.panNumber?.trim().toUpperCase() || null,
          isActive: jyotishi.isActive,
        }),
      });

      if (res.ok) {
        alert("Jyotishi updated successfully!");
        router.push("/dashboard/admin/agent");
      } else {
        const err = await res.json();
        throw new Error(err.error || "Failed to update Jyotishi");
      }
    } catch (err: any) {
      console.error("Update error:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error && !jyotishi) {
    return (
      <div className="p-4 max-w-5xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!jyotishi) {
    return null;
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Jyotishi</h1>
          <p className="text-muted-foreground">
            Manage astrologer profile & commission
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <div className="space-y-6">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={jyotishi.name}
                  onChange={(e) =>
                    setJyotishi({ ...jyotishi, name: e.target.value })
                  }
                  placeholder="Enter full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={jyotishi.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input
                  id="mobile"
                  value={jyotishi.mobile}
                  onChange={(e) =>
                    setJyotishi({ ...jyotishi, mobile: e.target.value })
                  }
                  placeholder="98XXXXXXXX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="commissionRate">Commission Rate (%) *</Label>
                <Input
                  id="commissionRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={jyotishi.commissionRate}
                  onChange={(e) =>
                    setJyotishi({
                      ...jyotishi,
                      commissionRate: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="15"
                />
                <p className="text-xs text-muted-foreground">
                  Percentage of course fee paid to Jyotishi
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardHeader>
            <CardTitle>Bank Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankAccountHolderName">Account Holder Name</Label>
              <Input
                id="bankAccountHolderName"
                value={jyotishi.bankAccountHolderName || ""}
                onChange={(e) =>
                  setJyotishi({
                    ...jyotishi,
                    bankAccountHolderName: e.target.value || null,
                  })
                }
                placeholder="As per bank records"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankAccountNumber">Account Number</Label>
                <Input
                  id="bankAccountNumber"
                  value={jyotishi.bankAccountNumber || ""}
                  onChange={(e) =>
                    setJyotishi({
                      ...jyotishi,
                      bankAccountNumber: e.target.value || null,
                    })
                  }
                  placeholder="1234567890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankIfscCode">IFSC Code</Label>
                <Input
                  id="bankIfscCode"
                  value={jyotishi.bankIfscCode || ""}
                  onChange={(e) =>
                    setJyotishi({
                      ...jyotishi,
                      bankIfscCode: e.target.value.toUpperCase() || null,
                    })
                  }
                  placeholder="SBIN0001234"
                  className="uppercase"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax Info */}
        <Card>
          <CardHeader>
            <CardTitle>Tax Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="panNumber">PAN Number</Label>
              <Input
                id="panNumber"
                value={jyotishi.panNumber || ""}
                onChange={(e) =>
                  setJyotishi({
                    ...jyotishi,
                    panNumber: e.target.value.toUpperCase() || null,
                  })
                }
                placeholder="ABCDE1234F"
                maxLength={10}
                className="uppercase font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Required for tax compliance and payments
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">
                  {jyotishi.isActive ? "Active" : "Inactive"}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {jyotishi.isActive
                    ? "Jyotishi can receive leads and commissions"
                    : "Account is deactivated"}
                </p>
              </div>
              <Switch
                id="isActive"
                checked={jyotishi.isActive}
                onCheckedChange={(checked) =>
                  setJyotishi({ ...jyotishi, isActive: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
