"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ActionSearchBar from "../SearchBar";
import { Icons } from "../ui/icons";

export default function LoginPage() {
    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            <div className="flex items-center justify-center px-8 py-10 md:px-12 lg:px-16 xl:px-24">
                <div className="mx-auto w-full max-w-sm space-y-6">
                    <div className="space-y-2 text-center">
                        <h1 className="text-3xl font-bold">Create an account</h1>
                        <p className="text-muted-foreground">Enter your information to get started</p>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" placeholder="m@example.com" required type="email" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" placeholder="********" required type="password" />
                        </div>
                        <Button className="w-full bg-orange-400 text-white" type="submit">
                            Login
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>

                    </div>
                    <div className="text-center text-sm">
                        Don't have an Acccount? {" "}
                        <Link className="underline hover:text-orange-400 hover:transition-colors transition-all" href="/auth/signup">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </div>
            <div className="hidden lg:block bg-orange-50">
                <div className="flex h-full items-center justify-center bg-muted p-8">
                    <div className="mx-auto w-full max-w-lg space-y-8 text-center">
                        <div className="relative mx-auto aspect-square w-40 overflow-hidden rounded-full">
                            <img
                                alt="User testimonial"
                                className="object-cover"
                                height={160}
                                src="/placeholder.svg?height=160&width=160"
                                width={160}
                            />
                        </div>
                        <blockquote className="space-y-2">
                            <p className="text-lg font-medium leading-relaxed">
                                &ldquo;This platform has transformed how I manage my business. The intuitive interface and powerful
                                features have made my daily operations so much smoother.&rdquo;
                            </p>
                            <footer className="text-sm text-muted-foreground">
                                <cite className="font-medium not-italic">Sarah Chen</cite>
                                {" · "}
                                <span>CEO at TechFlow</span>
                            </footer>
                            {/* <ActionSearchBar /> */}
                        </blockquote>
                    </div>
                </div>
            </div>
        </div>
    );
}
