"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

const schema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, { message: "Email is required" })
      .email({ message: "Invalid email address" }),
    password: z
      .string({ required_error: "Password is required" })
      .trim()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirm: z.string({ required_error: "Confirm is required" }).trim(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

export default function SignupForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      confirm: "",
    },
  });

  const { register, handleGoogleSignIn } = useAuth();

  return (
    <Form {...form}>
      <div className="p-6 m-auto w-full h-max max-w-[500px]">
        <form
          onSubmit={form.handleSubmit(register)}
          className="flex flex-col gap-8 p-8 rounded bg-secondary"
        >
          <h2 className="">Create an Account</h2>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Email<span className="text-red-700">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
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
                <FormLabel>
                  Password<span className="text-red-700">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Create a password"
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Must be as least 8 characters.
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
                  Confirm Password<span className="text-red-700">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Create a password"
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
              Create account
            </Button>
            <div className="flex items-center justify-center">
              <p>Already have an account?</p>{" "}
              <Button variant="link" size="link" className="ml-2">
                <Link href="/login">Login</Link>
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
          >
            <i className="fa-brands fa-google"></i>
            Continue with Google
          </Button>
        </form>
      </div>
    </Form>
  );
}
