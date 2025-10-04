"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../../utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState("Finishing sign-in...");
  const [error, setError] = useState(null);

  useEffect(() => {
    async function finishSignIn() {
      try {
        setStatus("Completing OAuth redirect...");

        let session = null;

        if (supabase?.auth?.getSessionFromUrl) {
          const { data, error } = await supabase.auth.getSessionFromUrl();
          if (error) {
            console.warn("Supabase getSessionFromUrl error:", error);
            setError(error.message);
          }
          session = data?.session ?? null;
        }

        if (!session && supabase?.auth?.getSession) {
          const { data } = await supabase.auth.getSession();
          session = data?.session ?? null;
        }

        if (session) {
          setStatus("Signed in — redirecting...");
          router.replace("/dashboard");
        } else {
          setStatus("No session found. You can try continuing manually.");
        }
      } catch (err) {
        console.error("Error finishing sign-in:", err);
        setError(err?.message ?? String(err));
        setStatus("Sign-in failed");
      }
    }

    finishSignIn();
  }, [router, supabase]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Signing you in</CardTitle>
          <CardDescription>{status}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            {error ? (
              <div className="text-sm text-destructive text-center">
                {error}
              </div>
            ) : null}

            <div className="text-xs text-muted-foreground text-center">
              If you aren’t redirected automatically, click continue.
            </div>

            <Button
              onClick={() => router.replace("/dashboard")}
              variant="default"
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
