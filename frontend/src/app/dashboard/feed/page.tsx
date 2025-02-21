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
import { Heart, MessageCircle, Share2, MapPin, Send } from "lucide-react";
import { motion } from "framer-motion";
import LocationName from "@/components/LocationName";

// Types
interface Post {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  location: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
}

interface Comment {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
}

export default function LocalFeed() {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      user: {
        name: "John Doe",
        username: "johndoe",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content: "Just discovered an amazing coffee shop in downtown! ☕",
      location: "Downtown",
      timestamp: "2 minutes ago",
      likes: 5,
      comments: [
        {
          id: "c1",
          user: {
            name: "Jane Smith",
            username: "janesmith",
            avatar: "/placeholder.svg?height=40&width=40",
          },
          content: "Which one? I need to check it out!",
          timestamp: "1 minute ago",
        },
      ],
    },
  ]);

  const [newPost, setNewPost] = useState("");
  const [currentLocation] = useState("Downtown");
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>(
    {}
  );

  const handlePost = () => {
    if (!newPost.trim()) return;

    const post: Post = {
      id: String(Date.now()),
      user: {
        name: "Current User",
        username: "currentuser",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content: newPost,
      location: currentLocation,
      timestamp: "Just now",
      likes: 0,
      comments: [],
    };

    setPosts([post, ...posts]);
    setNewPost("");
  };

  const handleComment = (postId: string) => {
    if (!commentInputs[postId]?.trim()) return;

    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [
              ...post.comments,
              {
                id: String(Date.now()),
                user: {
                  name: "Current User",
                  username: "currentuser",
                  avatar: "/placeholder.svg?height=40&width=40",
                },
                content: commentInputs[postId],
                timestamp: "Just now",
              },
            ],
          };
        }
        return post;
      })
    );

    setCommentInputs({ ...commentInputs, [postId]: "" });
  };

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return { ...post, likes: post.likes + 1 };
        }
        return post;
      })
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-primary">Local Feed</h1>
        <div className="flex items-center gap-2">
          <MapPin className="text-primary" />
          <span className="font-semibold text-primary">
            <LocationName />
          </span>
        </div>
      </header>

      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="create">Create Post</TabsTrigger>
        </TabsList>
        <TabsContent value="feed">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-6 pr-4">
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                      <Avatar>
                        <AvatarImage
                          src={post.user.avatar}
                          alt={post.user.name}
                        />
                        <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{post.user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          @{post.user.username}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <p className="mb-2 text-lg">{post.content}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin size={14} />
                        <span>{post.location}</span>
                        <span>•</span>
                        <span>{post.timestamp}</span>
                      </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4">
                      <div className="flex gap-6 w-full">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex gap-2"
                          onClick={() => handleLike(post.id)}
                        >
                          <Heart size={18} className="text-primary" />{" "}
                          {post.likes}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex gap-2"
                        >
                          <MessageCircle size={18} className="text-primary" />{" "}
                          {post.comments.length}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex gap-2"
                        >
                          <Share2 size={18} className="text-primary" />
                        </Button>
                      </div>

                      <div className="w-full space-y-4">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage
                                src={comment.user.avatar}
                                alt={comment.user.name}
                              />
                              <AvatarFallback>
                                {comment.user.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="text-sm">
                                <span className="font-semibold">
                                  {comment.user.name}
                                </span>
                                <span className="text-muted-foreground ml-2">
                                  {comment.timestamp}
                                </span>
                              </div>
                              <p className="text-sm">{comment.content}</p>
                            </div>
                          </div>
                        ))}

                        <div className="flex gap-2">
                          <Input
                            placeholder="Write a comment..."
                            value={commentInputs[post.id] || ""}
                            onChange={(e) =>
                              setCommentInputs({
                                ...commentInputs,
                                [post.id]: e.target.value,
                              })
                            }
                            className="text-sm"
                          />
                          <Button
                            size="icon"
                            onClick={() => handleComment(post.id)}
                          >
                            <Send size={18} />
                          </Button>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="create">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage
                      src="/placeholder.svg?height=40&width=40"
                      alt="Current User"
                    />
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
                <Button onClick={handlePost} className="self-end">
                  Post
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
