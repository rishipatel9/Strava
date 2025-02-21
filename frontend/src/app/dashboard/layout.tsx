

import { SidebarDemo } from "@/components/ui/AppSidebar";
import { NEXT_AUTH } from "@/lib/auth";
import { AuthOptions, getServerSession } from "next-auth";
import React from "react";

const getUserDetails = async () => {
  const session = await getServerSession(NEXT_AUTH as AuthOptions);
  return session;
};
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session= await getUserDetails();
  return (
    <div className="flex h-screen w-full">
      <SidebarDemo user={session}>
        {children}
      </SidebarDemo>
    </div>
  );
}
