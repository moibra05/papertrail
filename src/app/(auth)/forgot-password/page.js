"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
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
        <h2 className="">Password Reset</h2>
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
