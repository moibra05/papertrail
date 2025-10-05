"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Receipt } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

const schema = z
  .object({
    password: z
      .string()
      .trim()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirm: z.string().trim(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

export default function ResetPasswordPage() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      password: "",
      confirm: "",
    },
  });

  const { resetPassword } = useAuth();

  return (
    <Form {...form}>
      <div className="p-6 m-auto w-full h-fit max-w-[500px]">
        <form
          onSubmit={form.handleSubmit(resetPassword)}
          className="flex flex-col gap-8 p-8 rounded bg-secondary"
        >
          <div className="text-center">
            <div className="w-14 h-14 rounded-xl bg-[var(--primary)] p-2 shadow-md mx-auto flex items-center justify-center text-white mb-4">
              <Receipt className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold">Reset your password</h2>
            <p className="text-sm text-muted mt-2">
              Choose a new password for your account.
            </p>
          </div>

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  New password<span className="text-red-700">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Create a password"
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Must be at least 8 characters.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Confirm password<span className="text-red-700">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Confirm password"
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-4">
            <Button type="submit" size="submit">
              Set new password
            </Button>

            <div className="flex items-center justify-center">
              <p>Remembered your password?</p>
              <Button variant="link" size="link" className="ml-2">
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Form>
  );
}
