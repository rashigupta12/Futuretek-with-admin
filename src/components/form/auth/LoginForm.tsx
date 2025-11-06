"use client";

import { EyeOff, Eye } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "../../ui/button";
import { loginUser } from "@/actions/loginUser";
import { FormSuccess } from "../form-success";
import { FormError } from "../form-error";
import { LoginSchema } from "@/validaton-schema";
import { useRouter } from "next/navigation";

function LoginForm() {
 
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  async function onSubmit(data: z.infer<typeof LoginSchema>) {
    setError(undefined);
    setSuccess(undefined);

    startTransition(async () => {
      try {
        const result = await loginUser(data);
        
        if (result?.error) {
          setError(result.error);
          return;
        }

        if (result?.success) {
          setSuccess(result.success);
          
          // If there's a redirectTo, handle the redirect
          if (result.redirectTo) {
            // Small delay to show success message
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Use window.location to ensure session is properly loaded
            window.location.href = result.redirectTo;
          }
        }
      } catch (e) {
        console.error("Login error:", e);
        setError("An unexpected error occurred.");
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        {/* Logo Section */}
        <div className="flex flex-col items-center space-y-2">
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                <span className="text-white font-bold text-xl">F</span>
              </div>
            </div>
          </Link>
          <h1 className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold text-xl">
            Futuretek
          </h1>
        </div>

        {/* Login Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-600">Please login to your account</p>
        </div>

        {/* Login Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="text-sm font-medium text-gray-700">Email</div>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="john.snow@gmail.com"
                      className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      type="email"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="text-sm font-medium text-gray-700">Password</div>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="********"
                        className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        type={showPassword ? "text" : "password"}
                        disabled={isPending}
                      />
                    </FormControl>
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                      onClick={togglePasswordVisibility}
                      disabled={isPending}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <FormMessage className="text-sm text-red-500" />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  disabled={isPending}
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Button
                asChild
                variant="link"
                size="sm"
                className="px-0 text-sm text-purple-600 hover:text-purple-800"
              >
                <Link href="/auth/forgot-password">Forgot password?</Link>
              </Button>
            </div>

            <FormError message={error} />
            <FormSuccess message={success} />

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-[0.99] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isPending ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {success ? "Redirecting..." : "Logging in..."}
                </span>
              ) : (
                "Login now"
              )}
            </button>

            <div className="text-center">
              <Link 
                href="/auth/register" 
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Don&apos;t have an account? {" "}
                <span className="text-purple-600 hover:text-purple-800 font-medium">
                  Register Instead
                </span>
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default LoginForm;