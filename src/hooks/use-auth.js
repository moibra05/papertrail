import { createClient } from "../../utils/supabase/client";
import { toast } from "sonner";
import { redirect } from "next/navigation";

export function useAuth() {
  const supabase = createClient();

  async function login(formValues) {
    const { email, password } = formValues;

    const data = {
      email,
      password,
    };

    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
      toast.error(`Login failed. ${error.message}`);
      console.error("Login error:", error.message);
    } else {
      redirect("/dashboard");
    }
  }

  async function register(formValues) {
    const { email, password } = formValues;

    const data = {
      email,
      password,
    };

    const { error } = await supabase.auth.signUp(data);

    if (error) {
      toast.error(`Signup failed. ${error.message}`);
      console.error("Signup error:", error.message);
    } else {
      toast.success(
        "Account created successfully! Please check your email to verify your account."
      );
      redirect("/login");
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      toast.success("Logged out.");
      redirect("/login");
    }
    return { error };
  }

  async function forgotPassword(formValues) {
    const { email } = formValues;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
    });

    if (error) {
      toast.error(`Password reset failed. ${error.message}`);
      console.error("Password reset error:", error.message);
    } else {
      toast.success(
        "Password reset email sent! Please check your email for further instructions."
      );
    }
  }

  async function resetPassword(formValues) {
    const { password } = formValues;

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      console.error("Reset password error:", error);
      toast.error(`Could not reset password: ${error.message}`);
    } else {
      toast.success("Password updated. You can now log in.");
      router.push("/login");
    }
  }

  async function handleGoogleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      },
    });

    if (error) {
      toast.error(`Google sign-in failed. ${error.message}`);
      console.error("Google sign-in error:", error.message);
    }
  }

  return {
    login,
    register,
    signOut,
    forgotPassword,
    resetPassword,
    handleGoogleSignIn,
  };
}
