"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import home_bg from "../../../public/assets/images/home_bg.png";
import Image from "next/image";

const HomeContainer = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="h-screen w-full -mt-[108px] relative">
      <Image
        src={home_bg}
        alt="auth logo"
        fill
        className="object-cover"
        priority
      />
    </div>
  );
};

export default HomeContainer;