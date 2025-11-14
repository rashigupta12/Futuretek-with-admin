/* eslint-disable @typescript-eslint/no-unused-vars */

"use client"

import React, { useState, useTransition } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as z from "zod";
import { Eye, EyeOff, User, Mail, Phone, Lock, CheckCircle2, XCircle } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Role } from "@/validaton-schema";
import { registerUser } from "@/actions/registerUser";
import MainButton from "@/components/common/MainButton";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";

// Enhanced validation schema with detailed rules
const RegisterFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters")
    .refine(
      (name) => /^[a-zA-Z\s]+$/.test(name),
      {
        message: "Name can only contain letters and spaces",
      }
    ),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .refine(
      (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      },
      {
        message: "Please enter a valid email address (e.g., john@example.com)",
      }
    ),
  mobile: z
    .string()
    .min(1, "Phone number is required")
    .refine(
      (mobile) => {
        // Remove spaces, dashes, and parentheses for validation
        const cleanedMobile = mobile.replace(/[\s\-()]/g, '');
        // Check if it's a valid phone number (10-15 digits, may start with +)
        return /^\+?\d{10,15}$/.test(cleanedMobile);
      },
      {
        message: "Please enter a valid phone number (10-15 digits)",
      }
    ),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters")
    .refine(
      (password) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        
        return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
      },
      {
        message: "Password must contain uppercase, lowercase, number, and special character",
      }
    ),
  role: z.enum(["USER", "ADMIN", "JYOTISHI"]).optional(),
});

type RegisterFormProps = {
  text: string;
  role: Role;
};

const RegisterForm = ({ text, role }: RegisterFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const form = useForm<z.infer<typeof RegisterFormSchema>>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      password: "",
      role: "USER",
    },
    mode: "onChange", // Real-time validation
  });

  // Real-time validation handler
  const handleInputChange = (field: string, value: string) => {
    setValidationErrors(prev => ({ ...prev, [field]: "" }));
  };

  // Check password requirements for visual feedback
  const checkPasswordRequirements = (password: string) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
  };

  const passwordRequirements = checkPasswordRequirements(form.watch('password') || '');

  // Manual validation before submission
  const validateForm = (data: z.infer<typeof RegisterFormSchema>) => {
    const errors: Record<string, string> = {};

    // Name validation
    if (!data.name.trim()) {
      errors.name = "Name is required";
    } else if (data.name.length < 2) {
      errors.name = "Name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(data.name)) {
      errors.name = "Name can only contain letters and spaces";
    }

    // Email validation
    if (!data.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Mobile validation
    if (!data.mobile.trim()) {
      errors.mobile = "Phone number is required";
    } else {
      const cleanedMobile = data.mobile.replace(/[\s\-()]/g, '');
      if (!/^\+?\d{10,15}$/.test(cleanedMobile)) {
        errors.mobile = "Please enter a valid phone number";
      }
    }

    // Password validation
    if (!data.password) {
      errors.password = "Password is required";
    } else if (data.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else {
      const hasUpperCase = /[A-Z]/.test(data.password);
      const hasLowerCase = /[a-z]/.test(data.password);
      const hasNumbers = /\d/.test(data.password);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(data.password);
      
      if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        errors.password = "Password must meet all requirements";
      }
    }

    return errors;
  };

  const onSubmit = async (data: z.infer<typeof RegisterFormSchema>) => {
    if (role) {
      data.role = role;
    }

    setError(undefined);
    setSuccess(undefined);
    setValidationErrors({});

    // Manual validation before submission
    const errors = validateForm(data);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    startTransition(() => {
      registerUser(data)
        .then((data) => {
          if (data?.error) {
            setError(data.error);
          }
          if (data?.success) {
            form.reset();
            setSuccess(data.success);
            toast({
              title: "🎉 Registration success",
              description: data.success,
            });
          }
        })
        .catch(() => setError("Something went wrong!"));
    });
  };

  // Get field errors for display
  const getFieldError = (fieldName: keyof z.infer<typeof RegisterFormSchema>) => {
    return form.formState.errors[fieldName]?.message || validationErrors[fieldName];
  };

  // Check if form is valid
  const isFormValid = 
    form.watch('name')?.length > 0 && 
    form.watch('email')?.length > 0 && 
    form.watch('mobile')?.length > 0 &&
    form.watch('password')?.length > 0 &&
    Object.keys(validationErrors).length === 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border border-slate-200 shadow-lg">
        <CardHeader>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-blue-800">Hello!</h2>
            <p className="mt-2 text-sm text-slate-600">{text}</p>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700">
                      Full Name
                      <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                        <Input
                          {...field}
                          className={`h-12 pl-10 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            getFieldError('name') 
                              ? 'border-red-500 bg-red-50' 
                              : 'border-slate-300'
                          }`}
                          placeholder="John Doe"
                          disabled={isPending}
                          onChange={(e) => {
                            field.onChange(e);
                            handleInputChange('name', e.target.value);
                          }}
                        />
                      </div>  
                    </FormControl>
                    <FormMessage className="text-sm text-red-500 flex items-center gap-1">
                      {getFieldError('name') && (
                        <>
                          <span>⚠️</span>
                          {getFieldError('name')}
                        </>
                      )}
                    </FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700">
                      Email Address
                      <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
                        <Input
                          {...field}
                          className={`h-12 pl-10 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            getFieldError('email') 
                              ? 'border-red-500 bg-red-50' 
                              : 'border-slate-300'
                          }`}
                          placeholder="john@example.com"
                          type="email"
                          disabled={isPending}
                          onChange={(e) => {
                            field.onChange(e);
                            handleInputChange('email', e.target.value);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-sm text-red-500 flex items-center gap-1">
                      {getFieldError('email') && (
                        <>
                          <span>⚠️</span>
                          {getFieldError('email')}
                        </>
                      )}
                    </FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700">
                      Phone Number
                      <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
                        <Input
                          {...field}
                          className={`h-12 pl-10 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            getFieldError('mobile') 
                              ? 'border-red-500 bg-red-50' 
                              : 'border-slate-300'
                          }`}
                          placeholder="+1234567890"
                          disabled={isPending}
                          onChange={(e) => {
                            field.onChange(e);
                            handleInputChange('mobile', e.target.value);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-sm text-red-500 flex items-center gap-1">
                      {getFieldError('mobile') && (
                        <>
                          <span>⚠️</span>
                          {getFieldError('mobile')}
                        </>
                      )}
                    </FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700">
                      Password
                      <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
                        <Input
                          {...field}
                          className={`h-12 pl-10 pr-10 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            getFieldError('password') 
                              ? 'border-red-500 bg-red-50' 
                              : 'border-slate-300'
                          }`}
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          disabled={isPending}
                          onChange={(e) => {
                            field.onChange(e);
                            handleInputChange('password', e.target.value);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-50"
                          disabled={isPending}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-sm text-red-500 flex items-center gap-1">
                      {getFieldError('password') && (
                        <>
                          <span>⚠️</span>
                          {getFieldError('password')}
                        </>
                      )}
                    </FormMessage>
                    
                    {/* Password Requirements Checklist */}
                    {form.watch('password') && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-xs font-medium text-slate-700 mb-2">Password Requirements:</p>
                        <div className="space-y-1">
                          <PasswordRequirement 
                            met={passwordRequirements.length} 
                            text="At least 8 characters" 
                          />
                          <PasswordRequirement 
                            met={passwordRequirements.uppercase} 
                            text="One uppercase letter" 
                          />
                          <PasswordRequirement 
                            met={passwordRequirements.lowercase} 
                            text="One lowercase letter" 
                          />
                          <PasswordRequirement 
                            met={passwordRequirements.number} 
                            text="One number" 
                          />
                          <PasswordRequirement 
                            met={passwordRequirements.specialChar} 
                            text="One special character (!@#$...)" 
                          />
                        </div>
                      </div>
                    )}
                  </FormItem>
                )}
              />

              <FormError message={error} />
              <FormSuccess message={success} />

              <MainButton
                text="Register"
                classes="h-12 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                width="full_width"
                isSubmitable
                isLoading={isPending}
                disabled={isPending || !isFormValid}
              />

              <div className="text-center mt-4">
                <Link 
                  href="/auth/login" 
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  Already have an account? Login Instead
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

// Password requirement indicator component
const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
  <div className="flex items-center gap-2 text-xs">
    {met ? (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-slate-400" />
    )}
    <span className={met ? 'text-green-700' : 'text-slate-600'}>
      {text}
    </span>
  </div>
);

export default RegisterForm;