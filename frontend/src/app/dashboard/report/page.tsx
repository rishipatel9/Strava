"use client";
import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";
import { PublicKey, Connection, clusterApiUrl, Transaction, SystemProgram, sendAndConfirmTransaction, Keypair } from "@solana/web3.js";
import {
  ConnectionProvider,
  useWallet,
  WalletProvider
} from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import {
  WalletDisconnectButton,
  WalletModalProvider,
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import bs58 from "bs58";
import axios from "axios";

require('@solana/wallet-adapter-react-ui/styles.css');

function Page() {
  const [title, setTitle] = useState("");
  const [claiming, setClaiming] = useState(false);
  const { publicKey, connect, connected } = useWallet();

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    const formData = new FormData();
    formData.append("file", files[0]); 
    formData.append("upload_preset", "unsigned_preset");

    const loadingToastId = toast.loading("Uploading file...");

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );

      console.log("Uploaded Image URL:", response.data.secure_url);
      toast.success("File uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload file.");
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
    <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg p-6 space-y-4">
      <Input
        placeholder="Enter incident title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full"
      />

      <FileUpload onChange={handleFileUpload} />
      <Toaster />

      <Button className="w-full">Submit</Button>

      {!connected ? (
        <WalletMultiButton className="w-full mt-4" />
      ) : (
        <>
          <Button className="w-full mt-4" onClick={claimCryptoRewards} disabled={claiming}>
            {claiming ? "Claiming..." : "Claim Crypto Rewards"}
          </Button>
          <WalletDisconnectButton className="w-full mt-4" />
        </>
      )}
    </div>
  );
}

export default function App() {
  const wallets = [new PhantomWalletAdapter()];

  return (
    <ConnectionProvider endpoint={clusterApiUrl("devnet")}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Page />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
