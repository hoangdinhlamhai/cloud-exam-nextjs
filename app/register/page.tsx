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
        <div className="app-shell flex min-h-screen flex-col">
            <div className="relative flex flex-1 flex-col justify-center px-6 py-12">
                <div className="mx-auto w-full max-w-md">
                    <button onClick={() => router.back()} className="icon-button absolute left-6 top-6 flex h-10 w-10 items-center justify-center rounded-full" aria-label="Go back"><span>←</span></button>

                    <div className="mb-6 mt-8 text-center">
                        <h1 className="mb-2 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Create Account</h1>
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Join thousands of cloud professionals</p>
                    </div>

                    <form onSubmit={handleRegister} className="surface-card rounded-xl p-6">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="form-label ml-1 block text-xs font-medium">Full Name</label>
                                <input type="text" placeholder="Ex: Nguyen Van A" className="form-input h-12 w-full rounded-lg px-4" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                            </div>

                            <div className="space-y-1.5">
                                <label className="form-label ml-1 block text-xs font-medium">Email Address</label>
                                <input type="email" placeholder="name@example.com" className="form-input h-12 w-full rounded-lg px-4" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>

                            <div className="space-y-1.5">
                                <label className="form-label ml-1 block text-xs font-medium">Password</label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} placeholder="Min 8 characters" className="form-input h-12 w-full rounded-lg px-4 pr-12" value={password} onChange={(e) => setPassword(e.target.value)} />
                                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1" style={{ color: "var(--text-muted)" }} onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "👁" : "👁‍🗨"}</button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="form-label ml-1 block text-xs font-medium">Confirm Password</label>
                                <div className="relative">
                                    <input type={showConfirmPassword ? "text" : "password"} placeholder="Re-enter password" className="form-input h-12 w-full rounded-lg px-4 pr-12" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1" style={{ color: "var(--text-muted)" }} onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? "Hide password" : "Show password"}>{showConfirmPassword ? "👁" : "👁‍🗨"}</button>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 py-1">
                                <button type="button" onClick={() => setAgreedToTerms(!agreedToTerms)} className={`checkbox-control mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded ${agreedToTerms ? "border-blue-600 bg-blue-600" : ""}`}>
                                    {agreedToTerms && <span className="text-xs text-white">✓</span>}
                                </button>
                                <p className="text-xs leading-tight" style={{ color: "var(--text-secondary)" }}>By signing up, you agree to our <span className="app-link cursor-pointer">Terms</span> and <span className="app-link cursor-pointer">Privacy Policy</span>.</p>
                            </div>

                            <button type="submit" disabled={isLoading} className="primary-action flex h-12 w-full items-center justify-center rounded-lg text-base font-semibold">
                                {isLoading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Create Account"}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center"><p className="text-sm" style={{ color: "var(--text-secondary)" }}>Already have an account? <button onClick={() => router.push('/login')} className="auth-link font-bold">Sign In</button></p></div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
