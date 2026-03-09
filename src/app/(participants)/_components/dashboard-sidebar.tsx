"use client";
import { LogOut } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { signOut } from "next-auth/react";
import Image from "next/image";

import sidebarImg from "../../../../public/assets/images/sidebar-logo.png";
import { useState } from "react";
import LogoutModal from "@/components/modals/logout-modal";
import { toast } from "sonner";

const items = [
  {
    title: "Insight Engine",
    url: "/participants",
  },
];

export function DashboardSidebar() {
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const handLogout = async () => {
    try {
      toast.success("Logout successful!");
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <div>
      <Sidebar className="h-[calc(100vh-90px)] border-none w-[320px] mt-[90px]">
        {/* ✅ full height */}
        <SidebarContent className="bg-primary scrollbar-hide h-full">
          {/* ✅ full height */}
          <SidebarGroup className="p-0 h-full">
            {/* ✅ top + bottom fixed */}
            <div className="flex flex-col justify-between h-full pb-5">
              {/* ===== TOP: MENU ===== */}
              <div>
                <SidebarGroupContent className="px-6 pt-12">
                  <SidebarMenu>
                    {items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          className="bg-[#00253E] hover:bg-[#000f18] h-[56px] p-4 rounded-[8px] text-xl text-white hover:text-white font-semibold transition-all duration-300"
                          asChild
                        >
                          <Link href={item.url}>
                            <Image
                              src={sidebarImg}
                              alt="Sidebar Logo"
                              width={24}
                              height={24}
                            />
                            <span className="notranslate">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </div>

              {/* ===== BOTTOM: LOGOUT ===== */}
              <SidebarFooter className="px-6">
                <button
                  onClick={() => setLogoutModalOpen(true)}
                  className="flex items-center gap-3 px-4 py-3 rounded-[8px] text-[17px] font-semibold text-[#FF4D4D] hover:bg-black/5 transition-all duration-200 w-full"
                >
                  <LogOut className="w-6 h-6 flex-shrink-0" />
                  Log out
                </button>
              </SidebarFooter>
            </div>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* logout modal */}
      {logoutModalOpen && (
        <LogoutModal
          isOpen={logoutModalOpen}
          onClose={() => setLogoutModalOpen(false)}
          onConfirm={handLogout}
        />
      )}
    </div>
  );
}


















// "use client";
// import { LogOut } from "lucide-react";

// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from "@/components/ui/sidebar";
// import Link from "next/link";
// // import { usePathname } from "next/navigation";
// import { signOut } from "next-auth/react";
// import Image from "next/image";

// import sidebarImg from "../../../../public/assets/images/sidebar-logo.png";
// import { useState } from "react";
// import LogoutModal from "@/components/modals/logout-modal";
// import { toast } from "sonner";

// const items = [
//   {
//     title: "Insight Engine",
//     url: "/participants",
//     // icon: "../../../../public/assets/images/sidebar-logo.png",
//   },
// ];

// export function DashboardSidebar() {
//   // const pathName = usePathname();

//   const [logoutModalOpen, setLogoutModalOpen] = useState(false);

//   const handLogout = async () => {
//     try {
//       toast.success("Logout successful!");
//       await signOut({ callbackUrl: "/login" });
//     } catch (error) {
//       console.error("Logout failed:", error);
//       toast.error("Logout failed. Please try again.");
//     }
//   };

//   return (
//     <div>
//       <Sidebar className="h-screen border-none w-[320px] mt-[106px]">
//         <SidebarContent className="bg-primary scrollbar-hide ">
//           <SidebarGroup className="p-0">
//             <div className=" flex flex-col justify-between h-fit pb-5">
//               <div>
//                 <SidebarGroupContent className="px-6 pt-12">
//                   <SidebarMenu>
//                     {items.map((item) => {
//                       // const isActive =
//                       //   item.url === "/participants"
//                       //     ? pathName === "/participants"
//                       //     : pathName === item.url ||
//                       //       pathName.startsWith(`${item.url}/participants`);

//                       return (
//                         <SidebarMenuItem key={item.title}>
//                           {/* <SidebarMenuButton
//                           className={`h-[56px] rounded-[8px] text-xl text-white font-semibold transition-all duration-300 ${
//                             isActive &&
//                             "bg-[#f8f9fa] hover:bg-[#f8f9fa] text-primary shadow-[0px_4px_6px_0px_#DF10201A] hover:text-primary hover:shadow-[0px_4px_6px_0px_#DF10201A] font-medium"
//                           }`}
//                           asChild
//                         > */}
//                           <SidebarMenuButton
//                             className={`bg-[#00253E] hover:bg-[#000f18] h-[56px] p-4 rounded-[8px] text-xl text-white hover:text-white font-semibold transition-all duration-300`}
//                             asChild
//                           >
//                             <Link href={item.url}>
//                               {/* <item.icon /> */}
//                               <Image
//                                 src={sidebarImg}
//                                 alt="Sidebar Logo"
//                                 width={24}
//                                 height={24}
//                               />
//                               <span>{item.title}</span>
//                             </Link>
//                           </SidebarMenuButton>
//                         </SidebarMenuItem>
//                       );
//                     })}
//                   </SidebarMenu>
//                 </SidebarGroupContent>
//               </div>

//               <div className=" ">
//                 <SidebarFooter className="">
//                   <button
//                     onClick={() => setLogoutModalOpen(true)}
//                     className="flex items-center gap-3 px-4 py-3 rounded-[8px] text-[17px] font-semibold text-[#FF4D4D] hover:bg-black/5 transition-all duration-200 w-full mt-20"
//                   >
//                     <LogOut className="w-6 h-6 flex-shrink-0" />
//                     Log out
//                   </button>
//                 </SidebarFooter>

//               </div>
//             </div>
//           </SidebarGroup>
//         </SidebarContent>
//       </Sidebar>

//       {/* logout modal here */}

//       <div>
//         {logoutModalOpen && (
//           <LogoutModal
//             isOpen={logoutModalOpen}
//             onClose={() => setLogoutModalOpen(false)}
//             onConfirm={handLogout}
//           />
//         )}
//       </div>
//     </div>
//   );
// }
