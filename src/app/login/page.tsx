"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useSignInWithEmailAndPassword, useSignInWithGoogle, useSignInWithApple } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { User, Lock, Mail, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { FaApple, FaGoogle } from "react-icons/fa";
import logo from "@/public/logo.png";
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
            const result = await signInWithEmailAndPassword(email, password);
            if (result?.user) {
                router.push('/home');
            }
        } catch (err) {
            console.error("Login error:", err);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
            router.push('/home');
        } catch (err) {
            console.error("Google login error:", err);
        }
    };

    const handleAppleLogin = async () => {
        try {
            await signInWithApple();
            router.push('/home');
        } catch (err) {
            console.error("Apple login error:", err);
        }
    };

    const errorMessage = error?.message || googleError?.message || appleError?.message;
    const isLoading = loading || googleLoading || appleLoading;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
            },
        },
    };

    return (
        <div 
            className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-8" 
            style={{ 
                backgroundColor: '#0F0F0F',
                fontFamily: 'Inter, system-ui, sans-serif'
            }}
        >
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
            
            {/* Animated Background Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
                    style={{ background: "linear-gradient(135deg, #4DD4F7 0%, #8B6FFF 100%)" }}
                    animate={{
                        x: [0, 50, 0],
                        y: [0, 50, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                    }}
                />
                <motion.div
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
                    style={{ background: "linear-gradient(135deg, #FF6B7A 0%, #FFE14D 100%)" }}
                    animate={{
                        x: [0, -50, 0],
                        y: [0, -50, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                    }}
                />
            </div>

            {/* Login Card */}
            <motion.div
                className="relative z-10 w-full max-w-2xl"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div
                    className="rounded-3xl border p-8 sm:p-10 shadow-2xl"
                    style={{
                        backgroundColor: '#1A1A1A',
                        borderColor: '#2A2A2A',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
                    }}
                    variants={itemVariants}
                >
                    {/* Header with Logo */}
                    <motion.div 
                        className="mb-6 flex flex-col items-center text-center"
                        variants={itemVariants}
                    >
                        <motion.div
                            className="mb-4 flex h-24 w-24 items-center justify-center rounded-2xl overflow-hidden"
                            style={{
                                background: "linear-gradient(135deg, #4DD4F7 0%, #8B6FFF 100%)",
                                boxShadow: '0 8px 24px rgba(77, 212, 247, 0.3)'
                            }}
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Image
                                src={logo}
                                alt="Pal Creator Logo"
                                width={96}
                                height={96}
                                className="object-contain"
                                priority
                            />
                        </motion.div>
                        <h1 
                            className="text-4xl sm:text-5xl font-bold mb-2"
                            style={{ 
                                color: '#FFFFFF',
                                fontWeight: 700
                            }}
                        >
                            Bem vindo
                        </h1>
                        <p 
                            className="text-lg sm:text-xl"
                            style={{ 
                                color: '#888888',
                                lineHeight: 1.5
                            }}
                        >
                            Crie sua conta ou registre-se
                        </p>
                    </motion.div>

                    {/* Error Message */}
                    {errorMessage && (
                        <motion.div
                            className="mb-4 rounded-xl border p-4 flex items-start gap-3"
                            style={{
                                backgroundColor: 'rgba(255, 107, 122, 0.1)',
                                borderColor: '#FF6B7A'
                            }}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <AlertCircle size={20} style={{ color: '#FF6B7A' }} className="mt-0.5 shrink-0" />
                            <p className="text-sm" style={{ color: '#FF6B7A' }}>
                                {errorMessage}
                            </p>
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <motion.div variants={itemVariants}>
                            <label 
                                htmlFor="email" 
                                className="block mb-2 text-sm font-semibold"
                                style={{ color: '#FFFFFF' }}
                            >
                                Email
                            </label>
                            <div className="relative">
                                <div 
                                    className="absolute left-4 top-1/2 -translate-y-1/2"
                                    style={{ color: '#888888' }}
                                >
                                    <Mail size={20} />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    required
                                    className="w-full pl-12 pr-4 py-3 rounded-lg text-base text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        backgroundColor: '#2A2A2A',
                                        border: '1px solid #3A3A3A',
                                        borderRadius: '8px',
                                        color: '#FFFFFF',
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#5B9FFF';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#3A3A3A';
                                    }}
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label 
                                htmlFor="password" 
                                className="block mb-2 text-sm font-semibold"
                                style={{ color: '#FFFFFF' }}
                            >
                                Senha
                            </label>
                            <div className="relative">
                                <div 
                                    className="absolute left-4 top-1/2 -translate-y-1/2"
                                    style={{ color: '#888888' }}
                                >
                                    <Lock size={20} />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    required
                                    className="w-full pl-12 pr-4 py-3 rounded-lg text-base text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        backgroundColor: '#2A2A2A',
                                        border: '1px solid #3A3A3A',
                                        borderRadius: '8px',
                                        color: '#FFFFFF',
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#5B9FFF';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#3A3A3A';
                                    }}
                                />
                            </div>
                        </motion.div>

                        <motion.div 
                            className="flex justify-end"
                            variants={itemVariants}
                        >
                            <Link 
                                href="#" 
                                className="text-base transition-colors hover:opacity-80"
                                style={{ color: '#5B9FFF' }}
                            >
                                Esqueceu a senha?
                            </Link>
                        </motion.div>

                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 rounded-lg text-lg text-white font-semibold flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: "linear-gradient(90deg, #4DD4F7, #8B6FFF)",
                                borderRadius: "8px"
                            }}
                            whileHover={{ scale: isLoading ? 1 : 1.02 }}
                            whileTap={{ scale: isLoading ? 1 : 0.98 }}
                            variants={itemVariants}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={24} className="animate-spin" />
                                    Conectando...
                                </>
                            ) : (
                                <>
                                   <Image src={logo} alt="Pal Creator Logo" width={24} height={24} />
                                    Entrar
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Divider */}
                    <motion.div 
                        className="relative my-8"
                        variants={itemVariants}
                    >
                        <div 
                            className="absolute inset-0 flex items-center"
                            style={{ borderTop: '1px solid #2A2A2A' }}
                        >
                            <div className="w-full"></div>
                        </div>
                        <div className="relative flex justify-center text-base">
                            <span 
                                className="px-4"
                                style={{ 
                                    backgroundColor: '#1A1A1A',
                                    color: '#888888'
                                }}
                            >
                                ou continue com
                            </span>
                        </div>
                    </motion.div>

                    {/* Social Login Buttons */}
                    <motion.div 
                        className="grid grid-cols-2 gap-5"
                        variants={itemVariants}
                    >
                        <motion.button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-3 py-4 rounded-lg text-base text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: "#2A2A2A",
                                border: "1px solid #3A3A3A",
                                borderRadius: "8px"
                            }}
                            whileHover={{ scale: isLoading ? 1 : 1.02, borderColor: '#5B9FFF' }}
                            whileTap={{ scale: isLoading ? 1 : 0.98 }}
                        >
                            <FaGoogle size={22} />
                            Google
                        </motion.button>
                        <motion.button
                            type="button"
                            onClick={handleAppleLogin}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-3 py-4 rounded-lg text-base text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: "#2A2A2A",
                                border: "1px solid #3A3A3A",
                                borderRadius: "8px"
                            }}
                            whileHover={{ scale: isLoading ? 1 : 1.02, borderColor: '#5B9FFF' }}
                            whileTap={{ scale: isLoading ? 1 : 0.98 }}
                        >
                            <FaApple size={22} />
                            Apple
                        </motion.button>
                    </motion.div>

                    {/* Sign Up Link */}
                    <motion.div 
                        className="mt-10 text-center text-base"
                        style={{ color: '#888888' }}
                        variants={itemVariants}
                    >
                        <p>
                            Não tem uma conta?{" "}
                            <Link 
                                href="/signup" 
                                className="font-semibold transition-colors hover:opacity-80"
                                style={{ color: '#5B9FFF' }}
                            >
                                Criar conta
                            </Link>
                        </p>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
}
