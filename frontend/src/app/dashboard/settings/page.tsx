"use client"
import { Input } from "@/components/ui/input";
import { BASEURL } from "@/utils/constants";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { toast, Toaster } from "sonner";

const SettingsPage = () => {
  const [mobile, setMobile] = useState("");
  const { data: session } = useSession();

  const phoneNumberMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const response = await fetch(`${BASEURL}/user/update/phoneNumber`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user.id}`,
        },
        body: JSON.stringify({ phoneNumber }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update phone number");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || "Phone number updated successfully.");
      setMobile(""); // Clear input on success
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!/^[0-9]{10}$/.test(mobile)) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    phoneNumberMutation.mutate(mobile);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <p className="mb-2">Enter your mobile number to receive the latest updates:</p>
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
        <Input
          type="text"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          placeholder="Enter your mobile number"
          className="border p-2 rounded-md w-full"
        />
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded-md"
        //   disabled={phoneNumberMutation.isLoading}
        >
            Subscribe
          {/* {phoneNumberMutation.isLoading ? "Updating..." : "Subscribe"} */}
        </button>
      </form>
      <Toaster />
    </div>
  );
};

export default SettingsPage;
