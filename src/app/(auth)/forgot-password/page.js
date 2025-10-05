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
});

export default function ForgotPasswordForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
    },
  });

  const { forgotPassword } = useAuth();

  return (
    <Form {...form}>
      <div className="p-6 m-auto w-full h-fit max-w-[500px]">
        <form
          onSubmit={form.handleSubmit(forgotPassword)}
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
              <h2 className="text-2xl font-bold">Password reset</h2>
              <p className="text-sm text-muted mt-2">
                Enter your email to receive reset instructions.
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
          <Button type="submit" size="submit">
            Reset Password
          </Button>
          <div className="flex justify-end gap-6">
            <Button variant="link" size="link">
              <Link href="login">Login</Link>
            </Button>
            <Button variant="link" size="link">
              <Link href="register">Register</Link>
            </Button>
          </div>
        </form>
      </div>
    </Form>
  );
}
