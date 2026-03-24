"use client";

import {
  useState,
  useRef,
  useEffect,
  type KeyboardEvent,
  type ClipboardEvent,
} from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { parseCookies } from "nookies";

import AuthImage from "../../../../../../public/assets/images/auth_logo.png"

const COOKIE_NAME = "googtrans";

export default function OtpForm() {
  const cookie = parseCookies()[COOKIE_NAME];
  const lang = cookie?.split("/")?.[2] || "de";
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const decodedEmail = decodeURIComponent(email || "");
  const router = useRouter();

  // Focus the first input on component mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    // Update the OTP array
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1); // Only take the first character

    setOtp(newOtp);

    // Auto-focus next input if value is entered
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current input is empty
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0 &&
      inputRefs.current[index - 1]
    ) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle arrow keys for navigation
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // otp api integration
  const { mutate, isPending } = useMutation({
    mutationKey: ["verify-otp"],
    mutationFn: (values: { otp: string; email: string }) =>
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/verify-code`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(values),
      }).then((res) => res.json()),
    onSuccess: (data) => {
      if (!data?.status) {
        toast.error(data?.message || "Something went wrong");
        return;
      } else {
        toast.success(data?.message || "Email sent successfully!");
        router.push(
          `/forgot-password/otp/reset-password?email=${encodeURIComponent(decodedEmail)}`
        );
      }
    },
  });

  // reset otp api integrattion
  const { mutate: resentOtp, isPending: resentOtpPending } = useMutation({
    mutationKey: ["fotgot-password"],
    mutationFn: (email: string) =>
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/forget-password`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ email }),
      }).then((res) => res.json()),
    onSuccess: (data, email) => {
      if (!data?.status) {
        toast.error(data?.message || "Something went wrong");
        return;
      } else {
        toast.success(data?.message || "Email sent successfully!");
        router.push(`/forgot-password/otp?email=${encodeURIComponent(email)}`);
      }
    },
  });

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();

    // Check if pasted content is a valid 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);

      // Focus the last input
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
    }
  };

  // handle resend otp
  const handleResendOtp = async () => {
    resentOtp(decodedEmail);
  };

  // handle verify otp
  const handleVerify = async () => {
    const otpValue = otp.join("");

    // Check if OTP is complete
    if (otpValue.length !== 6) {
      toast.error("Please enter all 6 digits of the OTP.");
      return;
    }
    mutate({ otp: otpValue, email: decodedEmail });

    console.log("OTP Verified:", otpValue);
  };

  return (
    <div className="">
      <div className="w-full md:w-[479px] bg-white rounded-[16px] border-[2px] border-[#E7E7E7] shadow-[0px_0px_10px_0px_#0000001A] p-6">
        <div className="w-full flex items-center justify-center pb-7">
          <Link href="/">
          <Image src={AuthImage} alt="auth logo" width={500} height={500} className="w-[290px] h-[80px] object-contain"/>
          </Link>
        </div>

         <h3 className="text-xl md:text-2xl lg:text-[32px] font-semibold text-[#00253E] text-left leading-[120%] ">
          {lang === "de" ? "OTP eingeben" : "Enter OTP"}
        </h3>
        <p className="text-base font-normal text-[#666666] leading-[150%] text-left pt-1">
          {lang === "de"
            ? "Geben Sie den 6-stelligen OTP-Code ein, der an Ihre E-Mail gesendet wurde."
            : "Enter 6 digit OTP code has send on your email."}
        </p>
        {/* OTP Input Fields */}
        <div className="flex gap-[10px] md:gap-5 lg:gap-6 w-full justify-center pt-5 md:pt-6">
          {otp.map((digit, index) => (
            <Input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              className={` w-[52px] h-[52px] bg-white text-[#212121] placeholder:text-[#999999] text-center tracking-[0%] !text-xl font-semibold leading-[120%] rounded-[6px] focus:outline-none border-[2px] ${digit ? "border-primary" : "border-[#DADADA]"
                }`}
              aria-label={`OTP digit ${index + 1}`}
            />
          ))}
        </div>

        {/* Resend OTP */}
        <div className="text-center flex items-center justify-between pt-5 lg:pt-6 pb-5 lg:pb-6">
          <span className=" text-base font-medium leading-[120%] text-[#00253E] tracking-[0%]">
            {lang === "de" ? "Keinen OTP erhalten?" : "Didn't Receive OTP?"}{" "}
          </span>
          <button
            onClick={handleResendOtp}
            disabled={resentOtpPending}
            className=" text-base font-medium leading-[120%] text-[#00253E] tracking-[0%] hover:underline"
          >
            {resentOtpPending
              ? lang === "de"
                ? "Wird erneut gesendet..."
                : "Resending..."
              : lang === "de"
                ? "OTP ERNEUT SENDEN"
                : "RESEND OTP"}
          </button>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          type="submit"
          className="w-full h-[52px] bg-primary rounded-[8px] py-[15px] px-[151px] text-lg font-semibold  leading-[120%] tracking-[0%] text-[#00253E]"
          disabled={isPending}
        >
          {isPending
            ? lang === "de"
              ? "Wird überprüft..."
              : "Verifying..."
            : lang === "de"
              ? "Jetzt prüfen"
              : "Verify Now"}
        </button>
      </div>
    </div>
  );
}
