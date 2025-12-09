"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { User, Lock, Chrome, Apple } from 'lucide-react';
import { useSignInWithEmailAndPassword, useSignInWithGoogle, useSignInWithApple } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { FaApple, FaGoogle } from "react-icons/fa";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const [signInWithEmailAndPassword, user, loading, error] = useSignInWithEmailAndPassword(auth);
    const [signInWithGoogle, googleUser, googleLoading, googleError] = useSignInWithGoogle(auth);
    const [signInWithApple, appleUser, appleLoading, appleError] = useSignInWithApple(auth);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(email, password);
            console.log("Logged in user:", user);
            
        } catch (err) {
            console.error("Login error:", err);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
            router.push('/dashboard');
        } catch (err) {
            console.error("Google login error:", err);
        }
    };

    const handleAppleLogin = async () => {
        try {
            await signInWithApple();
            router.push('/dashboard');
        } catch (err) {
            console.error("Apple login error:", err);
        }
    };

    const errorMessage = error?.message || googleError?.message || appleError?.message;
    const isLoading = loading || googleLoading || appleLoading;

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-900 p-8">
            {/* Grid Background */}
            <div className="absolute inset-0 z-0 bg-grid opacity-10" />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 z-10 bg-gradient-to-br from-zinc-900 via-zinc-900/80 to-zinc-900" />

            {/* Animated Blobs */}
            <div className="absolute -top-1/4 -left-1/4 h-1/2 w-1/2 rounded-full bg-gradient-to-br from-purple-600/30 to-cyan-500/30 blur-3xl" />
            <div className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-gradient-to-tl from-blue-600/30 to-purple-500/30 blur-3xl" />

            {/* Login Card */}
            <div className="relative z-20 w-full max-w-md">
                {/* Header */}
                <div className="mb-8 flex flex-col items-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                        <span className="text-4xl">✨</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Bem vindo</h1>
                    <p className="text-zinc-400">Crie sua conta ou registre-se</p>
                </div>

                {/* Error Message */}
                {errorMessage && (
                    <div className="mb-4 rounded-lg bg-red-900/30 border border-red-700 p-3 text-sm text-red-400">
                        {errorMessage}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <Label htmlFor="email" className="text-zinc-300">
                            Email
                        </Label>
                        <div className="relative mt-2">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"><User /></span>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e: any) => setEmail(e.target.value)}
                                disabled={isLoading}
                                className="pl-10 border-zinc-700 bg-zinc-800/50 text-white placeholder-zinc-500 focus:border-cyan-500 focus:ring-cyan-500 disabled:opacity-50"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="password" className="text-zinc-300">
                            Password
                        </Label>
                        <div className="relative mt-2">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"><Lock /></span>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                className="pl-10 border-zinc-700 bg-zinc-800/50 text-white placeholder-zinc-500 focus:border-cyan-500 focus:ring-cyan-500 disabled:opacity-50"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Link href="#" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                            Forgot Password?
                        </Link>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-cyan-400 via-purple-500 to-blue-500 text-white font-semibold hover:scale-105 transition-transform shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Conectando..." : "Login"}
                    </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-zinc-900 px-2 text-zinc-400">ou continue com</span>
                    </div>
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <Button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 border border-zinc-700 bg-zinc-800/50 text-white hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaGoogle size={18} />
                        Google
                    </Button>
                    <Button
                        type="button"
                        onClick={handleAppleLogin}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 border border-zinc-700 bg-zinc-800/50 text-white hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaApple size={18} />
                        Apple
                    </Button>
                </div>

                {/* Sign Up Link */}
                <div className="mt-8 text-center text-sm text-zinc-400">
                    <p>
                        Don't have an account?{" "}
                        <Link href="/signup" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}