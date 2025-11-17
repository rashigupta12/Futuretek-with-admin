"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from 'sweetalert2';
import React, { useState, useEffect } from "react";

export default function AddJyotishiPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [commissionRate, setCommissionRate] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankIfscCode, setBankIfscCode] = useState("");
  const [bankAccountHolderName, setBankAccountHolderName] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankBranchName, setBankBranchName] = useState("");
  const [cancelledChequeImage, setCancelledChequeImage] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [bio, setBio] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [jyotishiCode, setJyotishiCode] = useState("");

  // Auto-generate code when name changes
  useEffect(() => {
    const generateCode = async () => {
      if (name.trim().length >= 2) {
        setGeneratingCode(true);
        try {
          const res = await fetch("/api/admin/jyotishi/generate-code", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name.trim() }),
          });

          if (res.ok) {
            const data = await res.json();
            setJyotishiCode(data.jyotishiCode);
          } else {
            console.error("Failed to generate code");
          }
        } catch (error) {
          console.error("Error generating code:", error);
        } finally {
          setGeneratingCode(false);
        }
      } else {
        setJyotishiCode("");
      }
    };

    const timeoutId = setTimeout(generateCode, 500);
    return () => clearTimeout(timeoutId);
  }, [name]);

  const validateMobile = (phone: string) => {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");

    if (!phone) {
      return "";
    }

    const indianPattern = /^(\+91|0)?[6-9]\d{9}$/;
    const digitsOnly = cleanPhone.replace(/^(\+91|0)/, "");

    if (digitsOnly.length !== 10) {
      return "Mobile number must be exactly 10 digits";
    }

    if (!indianPattern.test(cleanPhone)) {
      return "Please enter a valid 10 digit mobile number starting with 6-9";
    }

    return "";
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File',
        text: 'Please upload an image file (JPG, PNG, etc.)',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'Image size should be less than 5MB',
      });
      return;
    }

    setUploadingImage(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setCancelledChequeImage(reader.result as string);
        setUploadingImage(false);
      };
      reader.onerror = () => {
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text: 'Failed to process image',
        });
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: 'Failed to upload image',
      });
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setCancelledChequeImage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !commissionRate || !jyotishiCode) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Fields',
        text: 'Name, Email, Password, Commission Rate, and Jyotishi Code are required.',
      });
      return;
    }

    const mobileValidationError = validateMobile(mobile);
    if (mobileValidationError) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Mobile',
        text: mobileValidationError,
      });
      return;
    }

    setLoading(true);

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      mobile: mobile.trim() || null,
      jyotishiCode: jyotishiCode.trim().toUpperCase(),
      commissionRate: parseFloat(Number(commissionRate).toFixed(2)),
      bankAccountNumber: bankAccountNumber.trim() || null,
      bankIfscCode: bankIfscCode.trim().toUpperCase() || null,
      bankAccountHolderName: bankAccountHolderName.trim() || null,
      bankName: bankName.trim() || null,
      bankBranchName: bankBranchName.trim() || null,
      cancelledChequeImage: cancelledChequeImage || null,
      panNumber: panNumber.trim().toUpperCase() || null,
      bio: bio.trim() || null,
    };

    try {
      const res = await fetch("/api/admin/jyotishi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Jyotishi account created successfully!',
          timer: 2000,
          showConfirmButton: false
        });
        router.push("/dashboard/admin/agent");
      } else {
        const err = await res.json();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error || 'Failed to create jyotishi account',
        });
      }
    } catch (err) {
      console.error("Submission error:", err);
      Swal.fire({
        icon: 'error',
        title: 'Unexpected Error',
        text: 'An unexpected error occurred while creating the account',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="w-full mx-auto">
        <div className="mb-8">
          <Link
            href="/dashboard/admin/agent"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to astrologers
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Add New Astrologer
              </h1>
              <p className="text-gray-600">
                Create a new astrologer account with commission and banking
                details.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50 border-b">
              <CardTitle className="text-xl text-gray-900">
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm text-gray-700">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    const value = e.target.value;
                    const capitalized =
                      value.charAt(0).toUpperCase() + value.slice(1);
                    setName(capitalized);
                  }}
                  placeholder="Pandit Rajesh Sharma"
                  required
                  className="border-gray-300 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-gray-700">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rajesh@example.com"
                  required
                  className="border-gray-300 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-gray-700">
                  Password *
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="border-gray-300 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile" className="text-sm text-gray-700">
                  Mobile Number
                </Label>
                <Input
                  id="mobile"
                  type="tel"
                  value={mobile}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 10);
                    setMobile(value);
                    const error = validateMobile(value);
                    setMobileError(error);
                  }}
                  onBlur={(e) => {
                    const error = validateMobile(e.target.value);
                    setMobileError(error);
                  }}
                  placeholder="+91 98765 43210"
                  maxLength={15}
                  className={`border-gray-300 focus:border-blue-500 ${
                    mobileError ? "border-red-500 focus:border-red-500" : ""
                  }`}
                />
                {mobileError && (
                  <p className="text-red-500 text-sm mt-1">{mobileError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="jyotishiCode" className="text-sm text-gray-700">
                  Jyotishi Code * (Auto-generated)
                </Label>
                <div className="relative">
                  <Input
                    id="jyotishiCode"
                    type="text"
                    value={jyotishiCode}
                    readOnly
                    placeholder="Enter name to generate code..."
                    className="border-gray-300 bg-gray-50 font-mono uppercase pr-20"
                  />
                  {generatingCode && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Code is automatically generated based on the name
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="commissionRate"
                  className="text-sm text-gray-700"
                >
                  Commission Rate (%) *
                </Label>
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
                  className="border-gray-300 focus:border-amber-500"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="bio" className="text-sm text-gray-700">
                  Bio / Introduction
                </Label>
                <Textarea
                  id="bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Brief introduction about the jyotishi, expertise, and experience..."
                  className="border-gray-300 focus:border-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-50 border-b">
              <CardTitle className="text-xl text-gray-900">
                Banking & Tax Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="bankAccountNumber"
                  className="text-sm text-gray-700"
                >
                  Bank Account Number
                </Label>
                <Input
                  id="bankAccountNumber"
                  type="text"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="1234567890"
                  className="border-gray-300 focus:border-amber-500 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankIfscCode" className="text-sm text-gray-700">
                  IFSC Code
                </Label>
                <Input
                  id="bankIfscCode"
                  type="text"
                  value={bankIfscCode}
                  onChange={(e) => setBankIfscCode(e.target.value)}
                  placeholder="SBIN0001234"
                  className="border-gray-300 focus:border-amber-500 font-mono uppercase"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="bankAccountHolderName"
                  className="text-sm text-gray-700"
                >
                  Account Holder Name
                </Label>
                <Input
                  id="bankAccountHolderName"
                  type="text"
                  value={bankAccountHolderName}
                  onChange={(e) => setBankAccountHolderName(e.target.value)}
                  placeholder="Rajesh Sharma"
                  className="border-gray-300 focus:border-amber-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName" className="text-sm text-gray-700">
                  Bank Name
                </Label>
                <Input
                  id="bankName"
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="State Bank of India"
                  className="border-gray-300 focus:border-amber-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankBranchName" className="text-sm text-gray-700">
                  Bank Branch Name
                </Label>
                <Input
                  id="bankBranchName"
                  type="text"
                  value={bankBranchName}
                  onChange={(e) => setBankBranchName(e.target.value)}
                  placeholder="Connaught Place, New Delhi"
                  className="border-gray-300 focus:border-amber-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="panNumber" className="text-sm text-gray-700">
                  PAN Number
                </Label>
                <Input
                  id="panNumber"
                  type="text"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value)}
                  placeholder="ABCDE1234F"
                  className="border-gray-300 focus:border-amber-500 font-mono uppercase"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="cancelledCheque" className="text-sm text-gray-700">
                  Cancelled Cheque Image
                </Label>
                <div className="space-y-3">
                  {!cancelledChequeImage ? (
                    <div className="relative">
                      <Input
                        id="cancelledCheque"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                      <Label
                        htmlFor="cancelledCheque"
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                          uploadingImage
                            ? "border-gray-300 bg-gray-50"
                            : "border-gray-300 hover:border-amber-400 hover:bg-amber-50"
                        }`}
                      >
                        {uploadingImage ? (
                          <div className="flex flex-col items-center">
                            <div className="animate-spin h-8 w-8 border-3 border-amber-500 border-t-transparent rounded-full mb-2"></div>
                            <p className="text-sm text-gray-600">Uploading...</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">
                              Click to upload cancelled cheque image
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              PNG, JPG up to 5MB
                            </p>
                          </div>
                        )}
                      </Label>
                    </div>
                  ) : (
                    <div className="relative border-2 border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={cancelledChequeImage}
                          alt="Cancelled Cheque"
                          className="w-48 h-32 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="text-sm text-gray-700 font-medium mb-1">
                            Cancelled cheque uploaded successfully
                          </p>
                          <p className="text-xs text-gray-500">
                            Image will be saved with the account
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeImage}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Upload a clear image of a cancelled cheque for bank verification
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-6">
            <Button
              type="submit"
              disabled={loading || !jyotishiCode || generatingCode}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              {loading ? "Creating…" : "Create Jyotishi"}
            </Button>
            <Button
              type="button"
              variant="outline"
              asChild
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Link href="/dashboard/admin/agent">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}