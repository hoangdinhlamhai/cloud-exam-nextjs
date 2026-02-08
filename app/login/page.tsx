"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/components/Snackbar";
import { authService } from "@/services/auth";
import { setAuthToken } from "@/lib/api";

const LoginPage = () => {
    const router = useRouter();
    const { openSnackbar } = useSnackbar();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            openSnackbar({
                text: "Please enter email and password",
                type: "warning",
                duration: 3000,
            });
            return;
        }

        setIsLoading(true);
        try {
            const data = await authService.login(email, password);
            if (data.accessToken) {
                setAuthToken(data.accessToken);
            }
            openSnackbar({
                text: "Login successful!",
                type: "success",
                duration: 3000,
            });
            router.push('/home');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Login failed";
            openSnackbar({
                text: message,
                type: "error",
                duration: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 flex flex-col min-h-screen relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex-1 flex flex-col justify-center px-6 relative z-10 w-full max-w-md mx-auto">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="inline-block relative mb-4">
                        <div className="absolute inset-0 bg-cyan-400 rounded-2xl blur-lg opacity-40"></div>
                        <div className="relative w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
                            <span className="text-white font-black text-3xl">C</span>
                        </div>
                    </div>
                    <h1 className="text-white text-2xl font-bold mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-slate-400 text-sm">
                        Please sign in to continue learning
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="bg-slate-800/50 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-xl">
                    <div className="space-y-4">
                        {/* Email Input */}
                        <div className="space-y-1">
                            <label className="text-slate-300 font-medium text-xs ml-1 block">Email</label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full bg-slate-900/50 border border-white/10 text-white rounded-xl h-12 px-4 focus:border-cyan-500 focus:outline-none placeholder:text-slate-500"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-slate-300 font-medium text-xs">Password</label>
                                <button
                                    type="button"
                                    className="text-cyan-400 text-xs font-semibold cursor-pointer hover:text-cyan-300"
                                    onClick={() => console.log('Forgot password')}
                                >
                                    Forgot?
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    className="w-full bg-slate-900/50 border border-white/10 text-white rounded-xl h-12 px-4 pr-12 focus:border-cyan-500 focus:outline-none placeholder:text-slate-500"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? "👁" : "👁‍🗨"}
                                </button>
                            </div>
                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold text-base rounded-xl h-12 w-full shadow-lg shadow-cyan-500/20 mt-2 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative flex py-6 items-center">
                        <div className="flex-grow border-t border-slate-700"></div>
                        <span className="flex-shrink mx-4 text-slate-500 text-xs">Or continue with</span>
                        <div className="flex-grow border-t border-slate-700"></div>
                    </div>

                    {/* Social Login */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-700 border border-white/5 rounded-xl h-11 transition-colors"
                        >
                            <span className="text-blue-500">💬</span>
                            <span className="text-white text-sm font-medium">Zalo</span>
                        </button>
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-700 border border-white/5 rounded-xl h-11 transition-colors"
                        >
                            <span className="text-red-500">G</span>
                            <span className="text-white text-sm font-medium">Google</span>
                        </button>
                    </div>
                </form>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-slate-400 text-sm">
                        Don&apos;t have an account?{" "}
                        <button
                            onClick={() => router.push('/register')}
                            className="text-cyan-400 font-bold cursor-pointer hover:text-cyan-300 transition-colors"
                        >
                            Sign Up
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
