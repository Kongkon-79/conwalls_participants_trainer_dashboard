"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { Eye, EyeOff, LockKeyhole, Mail, User, UserPlus } from "lucide-react";
import { useState } from "react";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Label } from "@/components/ui/label";
import Link from "next/link";
import { getSession, signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";

import AuthImage from "../../../../../public/assets/images/auth_logo.png";
import { parseCookies } from "nookies";

const formSchema = z.object({
  role: z.enum(["PARTICIPANT", "TRAINER"]).default("PARTICIPANT"),
  // language: z.string().min(1, {
  //   message: "Please select a language.",
  // }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." }),
  // rememberMe: z.boolean(),
});

const COOKIE_NAME = "googtrans";

const LoginForm = () => {
  const cookie = parseCookies()[COOKIE_NAME];
  const lang = cookie?.split("/")?.[2] || "de";
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const session = useSession();
  console.log("session", session);
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "PARTICIPANT" as const,
      // language: "english",
      email: "",
      password: "",
      // rememberMe: false,
    },
  });

  // 2. Define a submit handler.
  // async function onSubmit(values: z.infer<typeof formSchema>) {
  //   try {
  //     setIsLoading(true);

  //     const res = await signIn("credentials", {
  //       email: values?.email,
  //       password: values?.password,
  //       role: values?.role,
  //       // language: values?.language,
  //       redirect: false,
  //     });

  //     // if (res?.error) {
  //     //   throw new Error(res.error);
  //     // }

  //     if (res?.error) {
  //       // if (res.error === "ADMIN_ONLY") {
  //       //   toast.error("Only admin can access this admin dashboard");
  //       //   return;
  //       // }

  //       if (res.error === "INVALID_CREDENTIALS") {
  //         toast.error("Email or Password wrong");
  //         return;
  //       }

  //       toast.error("Login failed");
  //       return;
  //     }

  //     toast.success("Login successful!");
  //     if (session?.data?.user?.role === "PARTICIPANT") {
  //       router.push("/participants");
  //     } else if (session?.data?.user?.role === "TRAINER") {
  //       router.push("/trainer/participants");
  //     } else {
  //       router.push("/login");
  //     }
  //   } catch (error) {
  //     console.error("Login failed:", error);
  //     toast.error("Login failed. Please try again.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      const res = await signIn("credentials", {
        email: values.email,
        password: values.password,
        role: values.role,
        redirect: false,
      });

      if (res?.error) {
        if (res.error === "INVALID_CREDENTIALS") {
          toast.error("Email or Password wrong");
          return;
        }

        toast.error("Login failed");
        return;
      }

      // 🔥 Important: wait for updated session
      const updatedSession = await getSession();

      toast.success("Login successful!");

      if (updatedSession?.user?.role === "PARTICIPANT") {
        router.push("/participants");
      } else if (updatedSession?.user?.role === "TRAINER") {
        router.push("/trainer/participants");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <div>
      <div className="w-full md:w-[479px] bg-white rounded-[16px] border-[2px] border-[#E7E7E7] shadow-[0px_0px_10px_0px_#0000001A] p-6">
        <div className="w-full flex items-center justify-center pb-4 xl:pb-5 2xl:pb-6">
          <Link href="/">
            <Image
              src={AuthImage}
              alt="auth logo"
              width={500}
              height={500}
              className="w-[260px] h-[79px] object-contain"
            />
          </Link>
        </div>

        <h3 className="text-xl md:text-2xl lg:text-[32px] font-semibold text-[#00253E] text-left leading-[120%] ">
          Sign in to Insight Engine
        </h3>
        <p className="text-base font-normal text-[#666666] leading-[150%] text-left pt-1 notranslate">
          
          {lang === "de" ? "Greifen Sie auf ihren Change Communication Arbeitsplatz zu." : "Access your change communication workspace"}
        
        </p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-2 pt-3 md:pt-4 2xl:pt-6"
          >
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg md:text-xl lg:text-2xl font-medium text-[#001B31]">
                    I am a
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => field.onChange("PARTICIPANT")}
                        className={`h-[48px] rounded-[8px] border  text-base font-medium transition ${
                          field.value === "PARTICIPANT"
                            ? "bg-gradient-to-b from-[#F1FFC5] via-[#F6FFDA] to-white border-primary text-[#666666]"
                            : "bg-white shadow-[0_0_10px_#0000001A]  text-[#666666]"
                        }`}
                      >
                        <User className="inline mr-1 w-4 h-4 text-[#292D32]" />{" "}
                        Participants
                      </button>

                      <button
                        type="button"
                        onClick={() => field.onChange("TRAINER")}
                        className={`h-[48px] rounded-[8px] border  text-base font-medium transition ${
                          field.value === "TRAINER"
                            ? "bg-gradient-to-b from-[#F1FFC5] via-[#F6FFDA] to-white border-primary text-[#666666]"
                            : "bg-white shadow-[0_0_10px_#0000001A]  text-[#666666]"
                        }`}
                      >
                        <UserPlus className="inline mr-1 w-4 h-4 text-[#292D32]" />{" "}
                        Trainer
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg md:text-xl lg:text-2xl font-medium text-[#001B31]">
                    <Globe className="inline mr-1 -mt-1 w-6 h-6 text-[#00253E]" /> Language
                  </FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full h-[48px] rounded-[8px] border border-[#6C6C6C] px-4 text-base"
                    >
                      <option value="english">English</option>
                      <option value="germany">German</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg md:text-xl lg:text-2xl font-medium text-[#001B31]">
                    <Mail className="inline mr-1 -mt-1 w-6 h-6 text-[#00253E]" />{" "}
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="w-full h-[48px] text-base font-medium leading-[120%] text-black rounded-[8px] outline-none p-4 border border-[#6C6C6C] placeholder:text-[#666666]"
                      placeholder="name@company.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg md:text-xl lg:text-2xl font-medium text-[#001B31] ">
                    <LockKeyhole className="inline mr-1 -mt-1 w-6 h-6 text-[#00253E]" />{" "}
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        className="w-full h-[48px] text-base font-medium leading-[120%] text-black rounded-[8px] outline-none p-4 border border-[#6C6C6C] placeholder:text-[#666666]"
                        placeholder="*******"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute top-3.5 right-4"
                      >
                        {showPassword ? (
                          <Eye onClick={() => setShowPassword(!showPassword)} />
                        ) : (
                          <EyeOff
                            onClick={() => setShowPassword(!showPassword)}
                          />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end">
              <Link
                className="text-base font-normal text-primary cursor-pointer leading-[120%] hover:underline"
                href="/forgot-password"
              >
                Forgot Password?
              </Link>
            </div>

            {/* <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <div className="w-full flex items-center justify-end">
                  <FormItem className="flex items-center gap-[10px]">
                    <FormControl className="mt-1">
                      <Checkbox
                        id="rememberMe"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-primary data-[state=checked]:text-white border-primary"
                      />
                    </FormControl>
                    <Label
                      className="text-sm font-medium text-[#2A2A2A] leading-[120%]"
                      htmlFor="rememberMe"
                    >
                      Remember Me
                    </Label>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                  <Link
                    className="text-base font-normal text-primary cursor-pointer leading-[120%] hover:underline"
                    href="/forgot-password"
                  >
                    Forgot Password?
                  </Link>
                </div>
              )}
            /> */}

            <div className="pt-3">
              <Button
                disabled={isLoading}
                className={`text-base font-medium text-[#00253E] cursor-pointer leading-[120%] rounded-[8px] py-4 w-full h-[50px] ${
                  isLoading ? "opacity-50 cursor-not-allowed" : "bg-primary"
                }`}
                type="submit"
              >
                {isLoading ? "Sign In ..." : "Sign In"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default LoginForm;
