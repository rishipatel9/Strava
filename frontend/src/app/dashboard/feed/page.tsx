"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, MessageCircle, Send, MapPin } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { BASEURL } from "@/utils/constants";
import { useSession } from "next-auth/react";
import { Toaster, toast } from 'sonner'
import Siriwave from 'react-siriwave';
import ReactSiriwave from "@/components/Strava";
import LocationName from "@/components/LocationName";
import useStore from "@/store/store";
import { format } from "date-fns";
import { MarqueeDemo } from "@/components/magicui/MarqueeDemo";


export default function LocalFeed() {
  const { data: session } = useSession();
  const [newPost, setNewPost] = useState("");
  const [description, setDescription] = useState("");
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>(
    {}
  );
  const { locationDetails } = useStore((state) => state)

  const queryClient = useQueryClient();

  // Fetch posts
  const { data, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const response = await axios.get(`${BASEURL}/posts/getall?latitude=${locationDetails.lat}&longitude=${locationDetails.lang}`, {
        headers: {
          Authorization: `Bearer ${session?.user.id}`,
        },
      });
      return response.data.data;
    },
  });

  // Like Mutation
  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      await axios.post(
        `${BASEURL}/posts/like/${postId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session?.user.id}`,
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  // Comment Mutation
  const commentMutation = useMutation({
    mutationFn: async ({ postId, comment }: { postId: string; comment: string }) => {
      await axios.post(
        `${BASEURL}/posts/comment/${postId}`,
        { comment },
        {
          headers: {
            Authorization: `Bearer ${session?.user.id}`,
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] }); // Refresh posts
    },
  });

  const postMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`${BASEURL}/posts/create`, {
        title: newPost, content: description, location: {
          lat: locationDetails.lat,
          lang: locationDetails.lang
        }
      }, {
        headers: {
          Authorization: `Bearer ${session?.user.id}`,
        },
      });
      return response;
    },
    onSuccess: () => {
      toast.success('Post Created Successfully')
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
    onError: () => {
      toast.error("Failed to create post")
    }
  })

  return (
    <div className=" mx-auto p-6 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-primary">Local Feed</h1>
      </header>

      <MarqueeDemo />

      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg p-1">
          <TabsTrigger value="feed" className="text-lg font-medium">Feed</TabsTrigger>
          <TabsTrigger value="create" className="text-lg font-medium">Create Post</TabsTrigger>
        </TabsList>

        {/* Feed Section */}
        <TabsContent value="feed">
          <ScrollArea className="h-[calc(100vh-250px)] space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <p className="animate-pulse text-gray-500">Loading posts...</p>
              </div>
            ) : (
              data.map((post:any) => (
                <Card key={post.id} className="p-5  border-b shadow-sm rounded-xl">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src="/placeholder.svg?height=40&width=40" alt={post.author.name} />
                        <AvatarFallback className="bg-gray-300 text-gray-700">
                          {post.author.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{post.author.name}</h3>
                        <p className="text-sm text-gray-500">
                          {format(new Date(post.createdAt), "MMM d, yyyy h:mm a")}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 text-sm leading-relaxed">{post.title || "No content available."}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </ScrollArea>
        </TabsContent>

        {/* Create Post Section */}
        <TabsContent value="create">
          <Card className="shadow-md p-5 rounded-xl">
            <CardContent>
              <div className="flex flex-col gap-4">
                {/* User Info */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Current User" />
                    <AvatarFallback className="bg-gray-300 text-gray-700">CU</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">Current User</h3>
                </div>

                {/* Input Fields */}
                <Input
                  placeholder="Give your post a title..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="border border-gray-300 p-3 rounded-lg"
                />
                <Textarea
                  placeholder="Write about what's happening in your area..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border border-gray-300 p-3 rounded-lg"
                />

                {/* Post Button */}
                <Button className="self-end bg-primary hover:bg-primary-dark transition-all">
                  Post
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Toaster />
    </div>
  );
}
