"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const signupSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["creator", "brand"], { required_error: "Pick a role" }),
});

type SignupValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
  });

  const selectedRole = watch("role");

  async function onSubmit(values: SignupValues) {
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { role: values.role },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Persist role for onboarding (session may not be active until email confirmed)
    // We store it in metadata; onboarding reads it from user.user_metadata.role
    router.push(`/onboarding?role=${values.role}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Join Bartr — trade your influence for products
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-5">
          {/* Role selector */}
          <div className="space-y-2">
            <Label>I am a…</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue("role", "creator")}
                className={cn(
                  "rounded-lg border-2 p-4 text-left transition-colors",
                  selectedRole === "creator"
                    ? "border-[#FF6B4A] bg-orange-50"
                    : "border-border hover:border-muted-foreground"
                )}
              >
                <div className="text-2xl mb-1">🎨</div>
                <div className="font-semibold text-sm">Creator</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  KOL, influencer, content creator
                </div>
              </button>
              <button
                type="button"
                onClick={() => setValue("role", "brand")}
                className={cn(
                  "rounded-lg border-2 p-4 text-left transition-colors",
                  selectedRole === "brand"
                    ? "border-[#FF6B4A] bg-orange-50"
                    : "border-border hover:border-muted-foreground"
                )}
              >
                <div className="text-2xl mb-1">🏢</div>
                <div className="font-semibold text-sm">Brand</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Company, shop, or product brand
                </div>
              </button>
            </div>
            {errors.role && (
              <p className="text-xs text-destructive">{errors.role.message}</p>
            )}
            {/* hidden input to register role in react-hook-form */}
            <input type="hidden" {...register("role")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 8 characters"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#FF6B4A] font-medium hover:underline"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
