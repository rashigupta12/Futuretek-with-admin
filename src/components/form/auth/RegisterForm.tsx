/* eslint-disable @typescript-eslint/no-unused-vars */


"use client"

import React, { useState, useTransition } from 'react';
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as z from "zod";
import { Eye, EyeOff, User, Mail, Phone, Lock } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { RegisterUserSchema, Role } from "@/validaton-schema";
import { registerUser } from "@/actions/registerUser";
import MainButton from "@/components/common/MainButton";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";

const FormSchema = RegisterUserSchema;

type RegisterFormProps = {
  text: string;
  role: Role;
};

const RegisterForm = ({ text, role }: RegisterFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      password: "",
      role: "USER",
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (role) {
      data.role = role;
    }

    setError(undefined);
    setSuccess(undefined);

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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                        <Input
                          {...field}
                          className="h-12 pl-10 w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Full name"
                          disabled={isPending}
                        />
                      </div>  
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
                        <Input
                          {...field}
                          className="h-12 pl-10 w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Email Address"
                          type="email"
                          disabled={isPending}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
                        <Input
                          {...field}
                          className="h-12 pl-10 w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Phone Number"
                          disabled={isPending}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
                        <Input
                          {...field}
                          className="h-12 pl-10 pr-10 w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          disabled={isPending}
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormError message={error} />
              <FormSuccess message={success} />

              <MainButton
                text="Register"
                classes="h-12 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                width="full_width"
                isSubmitable
                isLoading={isPending}
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

export default RegisterForm;