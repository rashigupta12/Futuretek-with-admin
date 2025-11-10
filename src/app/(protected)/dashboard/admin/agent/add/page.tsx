"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function AddJyotishiPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // ── Form Fields ─────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [commissionRate, setCommissionRate] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankIfscCode, setBankIfscCode] = useState("");
  const [bankAccountHolderName, setBankAccountHolderName] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [bio, setBio] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!name || !email || !password || !commissionRate) {
      alert("Name, Email, Password, and Commission Rate are required.");
      setLoading(false);
      return;
    }

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      mobile: mobile.trim() || null,
      commissionRate: Number(commissionRate),
      bankAccountNumber: bankAccountNumber.trim() || null,
      bankIfscCode: bankIfscCode.trim().toUpperCase() || null,
      bankAccountHolderName: bankAccountHolderName.trim() || null,
      panNumber: panNumber.trim().toUpperCase() || null,
      bio: bio.trim() || null,
    };

    try {
      const res = await fetch("/api/admin/jyotishi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Jyotishi account created successfully!");
        router.push("/dashboard/admin/agent");
      } else {
        alert(data.error || "Failed to create jyotishi");
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link
        href="/dashboard/admin/jyotishis"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jyotishis
      </Link>

      <h1 className="text-2xl font-bold mb-2">Add New Jyotishi</h1>
      <p className="text-muted-foreground mb-6">
        Create a new astrologer account with commission and banking details.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ── Personal Info ── */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Pandit Rajesh Sharma"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rajesh@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div>
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <Label htmlFor="commissionRate">Commission Rate (%) *</Label>
              <Input
                id="commissionRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                placeholder="15"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="bio">Bio / Introduction</Label>
              <Textarea
                id="bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief introduction about the jyotishi, expertise, and experience..."
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Banking Details ── */}
        <Card>
          <CardHeader>
            <CardTitle>Banking & Tax Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
              <Input
                id="bankAccountNumber"
                type="text"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                placeholder="1234567890"
              />
            </div>

            <div>
              <Label htmlFor="bankIfscCode">IFSC Code</Label>
              <Input
                id="bankIfscCode"
                type="text"
                value={bankIfscCode}
                onChange={(e) => setBankIfscCode(e.target.value)}
                placeholder="SBIN0001234"
                className="uppercase"
              />
            </div>

            <div>
              <Label htmlFor="bankAccountHolderName">Account Holder Name</Label>
              <Input
                id="bankAccountHolderName"
                type="text"
                value={bankAccountHolderName}
                onChange={(e) => setBankAccountHolderName(e.target.value)}
                placeholder="Rajesh Sharma"
              />
            </div>

            <div>
              <Label htmlFor="panNumber">PAN Number</Label>
              <Input
                id="panNumber"
                type="text"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value)}
                placeholder="ABCDE1234F"
                className="uppercase"
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Submit Buttons ── */}
        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create Jyotishi"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/admin/jyotishis">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}