"use client"
import { useSession } from "next-auth/react";
import Image from "next/image";
import React from "react";

import rightLogo from "../../../../public/assets/images/right_logo.png";

import leftLogo from "../../../../public/assets/images/left_logo.png";

import Link from "next/link";
import LanguageSwitcher from "@/components/ui/language-switcher";

const DashboardHeader = () => {
  const session = useSession();
  // console.log(session)
  const isLogin = session?.data?.user?.accessToken;
  const role = session?.data?.user?.role
  // console.log(isLogin, role)



  return (
    <div className="bg-[#00253E] h-[106px] w-full flex items-center sticky top-0  z-50">
      <div className="w-full flex items-center justify-between px-6 md:px-8 lg:px-12">
        <Link href={`${isLogin && role === "PARTICIPANT" ? "/participants" : isLogin && role === "TRAINER" ? "/trainer/participants" : "/"}`}>
          <Image
            src={leftLogo}
            alt="dashboard header"
            width={300}
            height={346}
            className="w-[80px] h-[80px] object-contain"
          />
        </Link>
        {/* Language Switcher */}
        <div className="flex items-center gap-8">
          <div>
            <LanguageSwitcher />
          </div>
          <Link href={`${isLogin && role === "PARTICIPANT" ? "/participants" : isLogin && role === "TRAINER" ? "/trainer/participants" : "/"}`}>
            <Image
              src={rightLogo}
              alt="dashboard header"
              width={300}
              height={346}
              className="w-[160px] h-[79px] object-contain"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
