"use client";
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Input } from "./ui/input"; // Assuming you're using ShadCN UI components

const UploadData = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [walletId, setWalletId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reward, setReward] = useState<string | null>(null);

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  }, []);

  // Initialize dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ["image/*", "video/*"], // Accept image and video files
    maxFiles: 1, // Limit to 1 file
    maxSize: 50000000, // Max size of 50MB
  });

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!walletId || files.length === 0) {
      alert("Please provide a wallet ID and select a file.");
      return;
    }

    setIsLoading(true);

    // Simulate a reward process
    setTimeout(() => {
      setReward("You have been rewarded with 10 tokens!");
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="p-6 max-w-lg mx-auto space-y-4">
      {/* Dropzone for image/video */}
      <div
        {...getRootProps({
          className:
            "border-2 border-dashed border-gray-400 p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
        })}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here...</p>
        ) : (
          <p>Drag 'n' drop an image or video here, or click to select files</p>
        )}
      </div>

      {/* Display selected file */}
      {files.length > 0 && (
        <div className="mt-2">
          <p>Selected file:</p>
          <p className="text-sm">{files[0].name}</p>
        </div>
      )}

      {/* Crypto wallet input */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="walletId" className="block text-sm font-medium mb-2">
            Your Crypto Wallet ID
          </label>
          <Input
            id="walletId"
            type="text"
            value={walletId}
            onChange={(e) => setWalletId(e.target.value)}
            placeholder="Enter your wallet ID"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Claim Reward"}
        </button>
      </form>

      {/* Reward Message */}
      {reward && <p className="mt-4 text-green-500">{reward}</p>}
    </div>
  );
};

export default UploadData;
