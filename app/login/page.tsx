"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/components/Snackbar";
import { authService } from "@/services/auth";
import { setAuthToken } from "@/lib/api";
import { GoogleLogin } from "@react-oauth/google";

const LoginPage = () => {
    const router = useRouter();
    const { openSnackbar } = useSnackbar();
    const [email, setEmail] = useState("lamhai@gmail.com");
    const [password, setPassword] = useState("12345678");
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

    const handleGoogleSuccess = async (credentialResponse: any) => {
        if (!credentialResponse.credential) {
            openSnackbar({
                text: "Google credential not found",
                type: "error",
                duration: 3000,
            });
            return;
        }

        setIsLoading(true);
        try {
            const data = await authService.googleLogin(credentialResponse.credential);
            if (data.accessToken) {
                setAuthToken(data.accessToken);
            }
            openSnackbar({
                text: "Login with Google successful!",
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
        <div className="app-shell flex min-h-screen flex-col">
            <div className="flex flex-1 flex-col justify-center px-6 py-12">
                <div className="mx-auto w-full max-w-md">
                    <div className="mb-8 text-center">
                        <div className="brand-mark mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl text-2xl font-bold">C</div>
                        <h1 className="mb-2 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Welcome Back</h1>
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Please sign in to continue learning</p>
                    </div>

                    <form onSubmit={handleLogin} className="surface-card rounded-xl p-6">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="form-label ml-1 block text-xs font-medium">Email</label>
                                <input type="email" placeholder="Enter your email" className="form-input h-12 w-full rounded-lg px-4" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between px-1">
                                    <label className="form-label text-xs font-medium">Password</label>
                                    <button type="button" className="auth-link text-xs font-semibold" onClick={() => console.log('Forgot password')}>Forgot?</button>
                                </div>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} placeholder="Enter your password" className="form-input h-12 w-full rounded-lg px-4 pr-12" value={password} onChange={(e) => setPassword(e.target.value)} />
                                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1" style={{ color: "var(--text-muted)" }} onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "👁" : "👁‍🗨"}</button>
                                </div>
                            </div>

                            <button type="submit" disabled={isLoading} className="primary-action mt-2 flex h-12 w-full items-center justify-center rounded-lg text-base font-semibold">
                                {isLoading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Sign In"}
                            </button>
                        </div>

                        <div className="flex items-center py-6"><div className="flex-grow border-t" style={{ borderColor: "var(--border-clr)" }} /><span className="mx-4 shrink text-xs" style={{ color: "var(--text-muted)" }}>Or continue with</span><div className="flex-grow border-t" style={{ borderColor: "var(--border-clr)" }} /></div>

                        <div className="flex w-full justify-center">
                            <div className="google-btn-container flex w-full max-w-xs justify-center">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => {
                                        openSnackbar({
                                            text: "Google Login Failed",
                                            type: "error",
                                            duration: 3000,
                                        });
                                    }}
                                    theme="outline"
                                    text="continue_with"
                                    shape="rectangular"
                                />
                            </div>
                        </div>
                    </form>

                    <div className="mt-8 text-center"><p className="text-sm" style={{ color: "var(--text-secondary)" }}>Don&apos;t have an account? <button onClick={() => router.push('/register')} className="auth-link font-bold">Sign Up</button></p></div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
