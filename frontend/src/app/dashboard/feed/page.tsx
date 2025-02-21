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


export default function LocalFeed() {
  const { data: session } = useSession();
  const [newPost, setNewPost] = useState("");
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>(
    {}
  );

  const queryClient = useQueryClient();

  // Fetch posts
  const { data, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const response = await axios.get(`${BASEURL}/posts/getall`, {
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
      queryClient.invalidateQueries({queryKey:["posts"]}); 
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
      queryClient.invalidateQueries({queryKey:["posts"]}); // Refresh posts
    },
  });

  const postMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`${BASEURL}/posts/create`, { title: newPost, content: "f" }, {
        headers: {
          Authorization: `Bearer ${session?.user.id}`,
        },
      });
      return response;
    },
    onSuccess:()=>{
      toast.success('post created')
      queryClient.invalidateQueries({queryKey:["posts"]})
    },
    onError:()=>{
      toast.error("Failed")
    }
  })

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-primary">Local Feed</h1>
        <div className="flex items-center gap-2">
          
          <MapPin className="text-primary" />
          <span className="font-semibold text-primary"><LocationName/></span>
        </div>
      </header>
      <ReactSiriwave/>

      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="create">Create Post</TabsTrigger>
        </TabsList>

        {/* Feed Section */}
        <TabsContent value="feed">
          <ScrollArea className="h-[calc(100vh-200px)]">
            {isLoading ? (
              <p>Loading posts...</p>
            ) : (
              data?.map((post: any) => (
                <Card key={post.id} className="mb-4">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="font-semibold">{post.title}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>{post.content}</p>
                  </CardContent>
                  <CardFooter className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      onClick={() => likeMutation.mutate(post.id)}
                    >
                      <Heart className="text-red-500" /> {post.likes.length}
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() => setCommentInputs((prev) => ({
                        ...prev,
                        [post.id]: prev[post.id] ? "" : "",
                      }))}
                    >
                      <MessageCircle /> {post.comments.length}
                    </Button>
                  </CardFooter>

                  {/* Comment Input */}
                  {commentInputs[post.id] !== undefined && (
                    <div className="p-4">
                      <Input
                        placeholder="Add a comment..."
                        value={commentInputs[post.id] || ""}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({
                            ...prev,
                            [post.id]: e.target.value,
                          }))
                        }
                      />
                      <Button
                        className="mt-2"
                        onClick={() =>
                          commentMutation.mutate({
                            postId: post.id,
                            comment: commentInputs[post.id],
                          })
                        }
                      >
                        <Send className="mr-2" /> Send
                      </Button>
                    </div>
                  )}
                </Card>
              ))
            )}
          </ScrollArea>
        </TabsContent>
        <TabsContent value="create">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Current User" />
                    <AvatarFallback>CU</AvatarFallback>
                  </Avatar>
                  <div className="font-semibold">Current User</div>
                </div>
                <Textarea
                  placeholder="What's happening in your area?"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button className="self-end" onClick={()=>postMutation.mutate()}>Post</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  );
}
