"use client";

import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast, Toaster } from "sonner";
import {
  Connection,
  clusterApiUrl,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  Keypair,
} from "@solana/web3.js";
import {
  ConnectionProvider,
  useWallet,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import {
  WalletDisconnectButton,
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import bs58 from "bs58";
import axios from "axios";
import { BASEURL } from "@/utils/constants";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

require("@solana/wallet-adapter-react-ui/styles.css");

function Page() {
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const { publicKey, connected } = useWallet();

  const [detectedClass, setDetectedClass] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  const user_id = session?.user.id;

  const incidentMutation = useMutation({
    mutationFn: async ({
      title,
      description,
      imageUrl,
      latitude,
      longitude,
      user_id,
    }: {
      title: string;
      description: string;
      imageUrl: string;
      latitude: string;
      longitude: string;
      user_id: string;
    }) => {
      await axios.post(
        `${BASEURL}/incident/create`,
        { title, description, imageUrl, latitude, longitude, user_id },
        { headers: { Authorization: `Bearer ${session?.user.id}` } }
      );
    },
  });

  const handleFileUpload = async (files: File[]) => {
    if (!files.length) return;
    const file = files[0];
    const verifyFormData = new FormData();
    verifyFormData.append("file", file);

    try {
      // Verify the file
      const { data: verifyData } = await axios.post(
        "http://127.0.0.1:5000/verify-incident",
        verifyFormData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      console.log("Verify Response:", verifyData);

      if (!verifyData.verified) {
        return toast.error("File verification failed. Upload aborted.");
      }
      setDetectedClass(verifyData.className);
      setConfidence(verifyData.confidence);
      setShowModal(true);

      // Upload to Cloudinary
      const cloudFormData = new FormData();
      cloudFormData.append("file", file);
      cloudFormData.append(
        "upload_preset",
        "strava"
      );
      cloudFormData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "");

      const loadingToastId = toast.loading("Uploading file to Cloudinary...");
      const { data: cloudData } = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        cloudFormData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success("File uploaded successfully!");
      console.log("Uploaded Image URL:", cloudData.secure_url);
      setUploadedImageUrl(cloudData.secure_url);
      toast.dismiss(loadingToastId);
    } catch (error: any) {
      console.error("Error during file operation:", error);
      toast.error("Failed to process the file.");
    }
  };

  const handleSubmit = async () => {
    if (!title || !description) {
      return toast.error("Please provide a title and description.");
    }
    if (!uploadedImageUrl) {
      return toast.error("Please upload and verify an image first.");
    }
    try {
      incidentMutation.mutate({
        title,
        description,
        imageUrl: uploadedImageUrl,
        latitude: "0.0",
        longitude: "0.0",
        user_id,
      });
      console.log("Incident submitted successfully!");
      toast.success("Incident report submitted successfully!");
    } catch (error: any) {
      console.error("Error submitting incident:", error);
      toast.error("Failed to submit incident report.");
    }
  };

  // claimCryptoRewards remains unchanged.
  // ...

  return (
    <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg p-6 space-y-4">
      <Input
        placeholder="Enter incident title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full"
      />
      <Input
        placeholder="Enter incident description..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full"
      />
      <FileUpload onChange={handleFileUpload} />
      <Toaster />
      <Button className="w-full" onClick={handleSubmit}>
        Submit
      </Button>
      {!connected ? (
        <WalletMultiButton className="w-full mt-4" />
      ) : (
        <>
          <Button className="w-full mt-4" /* onClick={claimCryptoRewards} */ disabled={claiming}>
            {claiming ? "Claiming..." : "Claim Crypto Rewards"}
          </Button>
          <WalletDisconnectButton className="w-full mt-4" />
        </>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <span className="text-green-500 text-2xl">✔️</span>
              <h3 className="text-xl font-bold">File Verified!</h3>
            </div>
            <p className="mt-4">
              Detected Class: <span className="font-semibold">{detectedClass}</span>
            </p>
            {confidence !== null && (
              <p className="mt-2">
                Confidence:{" "}
                <span className="font-semibold">
                  {typeof confidence === "number"
                    ? (confidence * 100).toFixed(2) + "%"
                    : confidence}
                </span>
              </p>
            )}
            <Button className="mt-4" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const wallets = [new PhantomWalletAdapter()];
  return (
    <ConnectionProvider endpoint="https://api.devnet.solana.com">
      <WalletProvider wallets={[new PhantomWalletAdapter()]} autoConnect>
        <WalletModalProvider>
          <Page />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}