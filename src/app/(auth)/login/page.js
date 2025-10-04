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
          <h2>Welcome Back</h2>
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
            <Button type="submit" size="submit">
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
          >
            <i className="fa-brands fa-google"></i>
            Continue with Google
          </Button>
        </form>
      </div>
    </Form>
  );
}
