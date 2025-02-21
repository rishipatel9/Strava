"use client"
import { Calendar, Home, Inbox, Search, Settings, User } from "lucide-react";
import Image from "next/image";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";

const items = [
  { title: "Home", url: "#", icon: Home },
  { title: "Location Dashboard", url: "#", icon: Inbox },
  { title: "Calendar", url: "#", icon: Calendar },
  { title: "Search", url: "#", icon: Search },
  { title: "Settings", url: "#", icon: Settings },
];

export function AppSidebar() {
  const getInitials = (name: string | null) => {
    if (!name) return "U";
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
    return initials;
  };
  const { data: session } = useSession();
  const userImage = session?.user?.image;
  const userName = session?.user?.name;
  const userEmail = session?.user?.email;
  const initials = getInitials(userName || null);

  return (
    <Sidebar>
      <SidebarContent className="bg-orange-100 flex flex-col h-screen">
        {/* Sidebar Menu */}
        <SidebarGroup className="flex-grow">
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="hover:bg-orange-200">
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="p-4 flex items-center gap-3">
          {userImage ? (
            <Image
              src={userImage}
              alt="User Avatar"
              width={30}
              height={30}
              className="rounded-full"
            />
          ) : (
            <div className="w-[30px] h-[30px] flex items-center justify-center rounded-full bg-gray-300 text-xs font-bold text-gray-700">
              {initials}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold">{userName}</p>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
