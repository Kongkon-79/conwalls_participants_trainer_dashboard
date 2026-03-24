"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Image from 'next/image'
import { useMutation } from "@tanstack/react-query";

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
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import AuthImage from "../../../../../public/assets/images/auth_logo.png"
import { Mail } from "lucide-react";
import { parseCookies } from "nookies";

const COOKIE_NAME = "googtrans";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});



const ForgotPasswordForm = () => {
  const cookie = parseCookies()[COOKIE_NAME];
  const lang = cookie?.split("/")?.[2] || "de";
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const {mutate, isPending} = useMutation({
    mutationKey: ["forgot-password"],
    mutationFn : async (values:{email:string})=>{
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/forget-password`,{
        method : "POST",
        headers: {
          "Content-Type" : "application/json"
        },
        body : JSON.stringify(values)
      });
      return res.json();
    },
    onSuccess: (data, email)=>{
      if(!data?.status){
        toast?.error(data?.message || "Something went wrong");
        return
      }
      toast?.success(data?.message || "OTP sent to your email");
      router.push(`/forgot-password/otp?email=${encodeURIComponent(email?.email)}`)
    }
  })

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
   console.log(values);
   mutate(values)
  }
  return (
    <div>
      <div className="w-full md:w-[479px] bg-white rounded-[16px] border-[2px] border-[#E7E7E7] shadow-[0px_0px_10px_0px_#0000001A] p-6">
        <div className="w-full flex items-center justify-center pb-6">
          <Link href="/">
          <Image src={AuthImage} alt="auth logo" width={500} height={500} className="w-[290px] h-[80px] object-contain"/>
          </Link>
        </div>

        <h3 className="text-xl md:text-2xl lg:text-[32px] font-semibold text-[#00253E] text-left leading-[120%] ">
          {lang === "de" ? "Passwort vergessen" : "Forgot Password"}
        </h3>
        <p className="text-base font-normal text-[#666666] leading-[150%] text-left pt-1">
          {lang === "de"
            ? "Geben Sie Ihre E-Mail-Adresse ein, um Ihr Passwort wiederherzustellen"
            : "Enter your email to recover your password"}
        </p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-2 pt-5 md:pt-6"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg md:text-xl lg:text-2xl font-medium text-[#001B31]">
                   <Mail className="inline mr-1 -mt-1 w-6 h-6 text-[#00253E]"/> {lang === "de" ? "E-Mail-Adresse" : "Email Address"}
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
            <div className="pt-4">
              <Button
                disabled={isPending}
                className={`text-base font-medium text-[#00253E] cursor-pointer leading-[120%] rounded-[8px] py-4 w-full h-[51px] ${
                  isPending ? "opacity-50 cursor-not-allowed" : "bg-primary"
                }`}
                type="submit"
              >
                {isPending
                  ? lang === "de"
                    ? "Wird gesendet..."
                    : "Sending..."
                  : lang === "de"
                    ? "OTP senden"
                    : "Send OTP"}
              </Button>
            </div>
            <div>
              
              <p className="text-sm font-medium leading-[150%] text-[#666666] text-center pt-2">
                {lang === "de" ? "Zurück zu " : "Back to "}
                <Link href="/login" className="text-primary hover:underline">
                  {lang === "de" ? "Anmelden" : "Log In"}
                </Link>
              </p>
              </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
