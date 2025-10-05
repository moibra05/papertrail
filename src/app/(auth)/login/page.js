"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Receipt, ChevronLeft } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

const schema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z.string().trim().min(1, { message: "Password is required" }),
});

export default function LoginForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { login, handleGoogleSignIn } = useAuth();

  return (
    <Form {...form}>
      <div className="p-6 m-auto w-full h-fit max-w-[500px]">
        <form
          onSubmit={form.handleSubmit(login)}
          className="flex flex-col gap-8 p-8 rounded bg-secondary"
        >
          <div>
            <div className="mb-4">
              <Link
                href="/"
                className="inline-flex items-center text-sm text-muted hover:underline"
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Back to home
              </Link>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-xl bg-[var(--primary)] p-2 shadow-md mx-auto flex items-center justify-center text-white mb-4">
                <Receipt className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold">Welcome back</h2>
              <p className="text-sm text-muted mt-2">
                Log in to manage your receipts and insights.
              </p>
            </div>
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="example@email.com" {...field} />
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="&#183; &#183; &#183; &#183; &#183; &#183; &#183; &#183;"
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <Button variant="link" size="link" className="ml-auto">
                  <Link href="/forgot-password">Forgot your password?</Link>
                </Button>
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-4">
            <Button
              type="submit"
              size="submit"
              className="w-full bg-[var(--primary)] text-white font-semibold"
            >
              Login
            </Button>
            <div className="flex items-center justify-center">
              <p>Don&apos;t have an account yet?</p>
              <Button variant="link" size="link" className="ml-2">
                <Link href="/register">Register</Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-1 h-[1px] bg-muted-foreground mr-3"></div>
            Or
            <div className="flex-1 h-[1px] bg-muted-foreground ml-3"></div>
          </div>
          <Button
            variant="outline"
            size="submit"
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full"
          >
            <i className="fa-brands fa-google mr-2"></i>
            Continue with Google
          </Button>
        </form>
      </div>
    </Form>
  );
}
