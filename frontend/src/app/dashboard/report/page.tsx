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
  const [isVerified, setIsVerified] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);

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

  const AlertMutation = useMutation({
    mutationFn: async (alert:any) => {
      await axios.post(`/api/emergency`, {
        eventType :alert.type,
        location: alert.location,
        numbers: alert.numbers
      }, {
        headers: { Authorization: `Bearer ${session?.user.id}` },
      });
    },
  });

  // Track image verification status

  const handleFileUpload = async (files: File[]) => {
    if (!files.length) return;
    const file = files[0];
    const verifyFormData = new FormData();
    verifyFormData.append("file", file);

    try {
      // Verify the file
      const { data: verifyData } = await axios.post(
        "http://logical-witty-ocelot.ngrok-free.app/verify-incident",
        verifyFormData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      console.log("Verify Response:", verifyData);

      if (!verifyData.verified) {
        setIsVerified(false); // Reset verification flag
        return toast.error("File verification failed. Upload aborted.");
      }

      setDetectedClass(verifyData.className);
      setConfidence(verifyData.confidence);
      setShowModal(true);
      setIsVerified(true); // Set verification flag to true

      const cloudFormData = new FormData();
      cloudFormData.append("file", file);
      cloudFormData.append("upload_preset", "strava");
      cloudFormData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "");

      const loadingToastId = toast.loading("Uploading file to Cloudinary...");
      const { data: cloudData } = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        cloudFormData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success("File uploaded successfully!");
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
    if (!detectedClass) {
      return toast.error("Please verify the uploaded image before submitting.");
    }
    if (!connected && isClaimed) {
      return toast.error("Please connect your Phantom wallet first.");
    }

    // Show loading toast
    const loadingToastId = toast.loading("Submitting incident and claiming rewards...");

    try {
      // Submit incident
      await incidentMutation.mutateAsync({
        title,
        description,
        imageUrl: uploadedImageUrl,
        latitude: "0.0",
        longitude: "0.0",
        user_id,
      });

      await 
      console.log("Incident submitted successfully!");
      toast.success("Incident report submitted successfully!");

      if (isClaimed) {
        await claimCryptoRewards();
      }

      setTitle("");
      setDescription("");
      setUploadedImageUrl(null);
      setDetectedClass(null);
    } catch (error: any) {
      console.error("Error during submission:", error);
      toast.error("Failed to submit incident or claim rewards.");
    } finally {
      toast.dismiss(loadingToastId);
    }
  };


  const claimCryptoRewards = async () => {
    if (!connected) {
      toast.error("Please connect your Phantom wallet first.");
      return;
    }

    console.log("Receiver Public Key:", publicKey?.toBase58());

    const base58PrivateKey = process.env.NEXT_PUBLIC_PHANTOM_PRIVATE_KEY || "";
    const senderKeyPair = Keypair.fromSecretKey(bs58.decode(base58PrivateKey));

    try {
      setClaiming(true);

      // Show a loading toast
      const loadingToastId = toast.loading("Processing transaction...");

      const connection = new Connection(clusterApiUrl("devnet"));

      if (!publicKey) {
        toast.error("Failed to get public key from wallet.");
        toast.dismiss(loadingToastId);
        return;
      }

      // Check sender's balance
      const senderBalance = await connection.getBalance(senderKeyPair.publicKey);
      console.log("Sender Balance:", senderBalance);

      if (senderBalance < 10000) {
        toast.error("Sender account has insufficient funds.");
        toast.dismiss(loadingToastId);
        return;
      }

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: senderKeyPair.publicKey,
          toPubkey: publicKey,
          lamports: 100000,
        })
      );

      console.log(transaction);

      const signature = await sendAndConfirmTransaction(connection, transaction, [senderKeyPair]);

      toast.success(`Claim successful! TX: ${signature}`);
      toast.dismiss(loadingToastId);
    } catch (error) {
      console.error(error);
      toast.error("Failed to claim rewards.");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto min-h-96 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black rounded-xl p-8 space-y-6 shadow-lg">
      <h2 className="text-2xl font-bold text-center">Report an Incident</h2>

      <div className="space-y-4">
        <Input
          placeholder="Incident Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full"
        />
        <Input
          placeholder="Incident Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full"
        />
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="claim"
            checked={isClaimed}
            onChange={() => setIsClaimed(!isClaimed)}
            className="h-5 w-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="claim" className="text-sm font-medium">Claim Crypto Rewards</label>
        </div>
        <FileUpload onChange={handleFileUpload} />
      </div>

      {/* Wallet Connect Button */}
      {isClaimed && (
        <div className="flex justify-center">
          {!connected ? (
            <WalletMultiButton className="mt-4 w-full" />
          ) : (
            <WalletDisconnectButton className="mt-4 w-full" />
          )}
        </div>
      )}

      <Button
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg transition"
        onClick={handleSubmit}
        disabled={!isVerified || !uploadedImageUrl}
      >
        Submit Report
      </Button>

      <Toaster />

      {/* Modal for File Verification */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm">
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
            <Button className="mt-4 w-full bg-gray-700 hover:bg-gray-800 text-white" onClick={() => setShowModal(false)}>
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