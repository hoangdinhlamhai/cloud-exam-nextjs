"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/components/Snackbar";
import { authService } from "@/services/auth";

const RegisterPage = () => {
    const router = useRouter();
    const { openSnackbar } = useSnackbar();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!fullName || !email || !password || !confirmPassword) {
            openSnackbar({
                text: "Please fill in all fields",
                type: "warning",
                duration: 3000,
            });
            return;
        }

        if (password !== confirmPassword) {
            openSnackbar({
                text: "Passwords do not match",
                type: "error",
                duration: 3000,
            });
            return;
        }

        if (!agreedToTerms) {
            openSnackbar({
                text: "Please agree to Terms and Privacy Policy",
                type: "warning",
                duration: 3000,
            });
            return;
        }

        setIsLoading(true);
        try {
            await authService.register(fullName, email, password);
            openSnackbar({
                text: "Registration successful! Please login.",
                type: "success",
                duration: 3000,
            });
            router.push('/login');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Registration failed";
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
            <div className="absolute top-0 right-1/2 translate-x-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex-1 flex flex-col justify-center px-6 py-8 relative z-10 w-full max-w-md mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="absolute top-6 left-6 w-10 h-10 rounded-full bg-slate-800/50 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors"
                >
                    <span className="text-white">←</span>
                </button>

                {/* Header Section */}
                <div className="text-center mb-6 mt-8">
                    <h1 className="text-white text-2xl font-bold mb-2">
                        Create Account
                    </h1>
                    <p className="text-slate-400 text-sm">
                        Join thousands of cloud professionals
                    </p>
                </div>

                {/* Register Form */}
                <form onSubmit={handleRegister} className="bg-slate-800/50 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-xl">
                    <div className="space-y-4">
                        {/* Full Name */}
                        <div className="space-y-1">
                            <label className="text-slate-300 font-medium text-xs ml-1 block">Full Name</label>
                            <input
                                type="text"
                                placeholder="Ex: Nguyen Van A"
                                className="w-full bg-slate-900/50 border border-white/10 text-white rounded-xl h-12 px-4 focus:border-cyan-500 focus:outline-none placeholder:text-slate-500"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="text-slate-300 font-medium text-xs ml-1 block">Email Address</label>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                className="w-full bg-slate-900/50 border border-white/10 text-white rounded-xl h-12 px-4 focus:border-cyan-500 focus:outline-none placeholder:text-slate-500"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <label className="text-slate-300 font-medium text-xs ml-1 block">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Min 8 characters"
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

                        {/* Confirm Password */}
                        <div className="space-y-1">
                            <label className="text-slate-300 font-medium text-xs ml-1 block">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Re-enter password"
                                    className="w-full bg-slate-900/50 border border-white/10 text-white rounded-xl h-12 px-4 pr-12 focus:border-cyan-500 focus:outline-none placeholder:text-slate-500"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? "👁" : "👁‍🗨"}
                                </button>
                            </div>
                        </div>

                        {/* Terms Checkbox */}
                        <div className="flex items-start gap-3 py-1">
                            <button
                                type="button"
                                onClick={() => setAgreedToTerms(!agreedToTerms)}
                                className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${agreedToTerms
                                        ? "bg-cyan-500 border-cyan-500"
                                        : "border-slate-600 bg-slate-900/50"
                                    }`}
                            >
                                {agreedToTerms && <span className="text-white text-xs">✓</span>}
                            </button>
                            <p className="text-slate-400 text-xs leading-tight">
                                By signing up, you agree to our <span className="text-cyan-400 cursor-pointer">Terms</span> and <span className="text-cyan-400 cursor-pointer">Privacy Policy</span>.
                            </p>
                        </div>

                        {/* Sign Up Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold text-base rounded-xl h-12 w-full shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </div>
                </form>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-slate-400 text-sm">
                        Already have an account?{" "}
                        <button
                            onClick={() => router.push('/login')}
                            className="text-cyan-400 font-bold cursor-pointer hover:text-cyan-300 transition-colors"
                        >
                            Sign In
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
