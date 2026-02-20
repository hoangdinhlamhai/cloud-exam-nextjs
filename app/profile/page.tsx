"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { profileService } from "@/services/profile";

interface UserProfile {
    id: number;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
    createdAt: string;
}

interface UserStats {
    totalExamsTaken: number;
    averageScore: number;
    totalCorrectAnswers: number;
    totalQuestions: number;
    passedExams: number;
    failedExams: number;
    totalNotes: number;
}

/* ──────────── component ──────────── */
export default function ProfilePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    /* ── profile data from API ── */
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    /* ── editable state ── */
    const [fullName, setFullName] = useState("");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    /* ── ui state ── */
    const [activeTab, setActiveTab] = useState<"info" | "password">("info");
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

    /* helpers */
    const showToast = (text: string, type: "success" | "error" = "success") => {
        setToast({ text, type });
        setTimeout(() => setToast(null), 3000);
    };

    /* ── Fetch profile + stats on mount ── */
    const fetchProfile = useCallback(async () => {
        try {
            setIsLoading(true);
            const [profileData, statsData] = await Promise.all([
                profileService.getProfile(),
                profileService.getStats().catch(() => null),
            ]);
            setProfile(profileData);
            setFullName(profileData.fullName || "");
            setAvatarPreview(profileData.avatarUrl || null);
            if (statsData) setStats(statsData);
        } catch {
            showToast("Không thể tải thông tin hồ sơ", "error");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const initials = (fullName || profile?.email || "U")
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const memberSince = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : "";

    /* ── avatar file handler ── */
    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate type
        if (!file.type.startsWith("image/")) {
            showToast("Vui lòng chọn file ảnh (jpg, png, webp…)", "error");
            return;
        }
        // Validate size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast("Ảnh quá lớn. Tối đa 5MB", "error");
            return;
        }

        // Show local preview immediately
        setAvatarFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to R2 immediately
        try {
            setIsUploading(true);
            const updatedUser = await profileService.uploadAvatar(file);
            setProfile(updatedUser);
            setAvatarPreview(updatedUser.avatarUrl);
            setAvatarFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            showToast("Tải ảnh đại diện thành công!");
        } catch (err: any) {
            showToast(err.message || "Lỗi khi tải ảnh đại diện", "error");
            // Revert preview
            setAvatarPreview(profile?.avatarUrl || null);
            setAvatarFile(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveAvatar = async () => {
        if (!profile?.avatarUrl) {
            // No avatar saved on server, just clear local state
            setAvatarPreview(null);
            setAvatarFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        try {
            setIsUploading(true);
            const updatedUser = await profileService.deleteAvatar();
            setProfile(updatedUser);
            setAvatarPreview(null);
            setAvatarFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            showToast("Đã xoá ảnh đại diện!");
        } catch (err: any) {
            showToast(err.message || "Lỗi khi xoá ảnh đại diện", "error");
        } finally {
            setIsUploading(false);
        }
    };

    /* ── Save profile (fullName) ── */
    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const updatedUser = await profileService.updateProfile({ fullName });
            setProfile(updatedUser);
            showToast("Cập nhật hồ sơ thành công!");
        } catch (err: any) {
            showToast(err.message || "Lỗi khi cập nhật hồ sơ", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) {
            showToast("Vui lòng điền đầy đủ thông tin", "error");
            return;
        }
        if (newPassword.length < 6) {
            showToast("Mật khẩu mới phải có ít nhất 6 ký tự", "error");
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast("Xác nhận mật khẩu không khớp", "error");
            return;
        }
        setIsSaving(true);
        try {
            await profileService.updateProfile({ currentPassword, newPassword });
            showToast("Đổi mật khẩu thành công!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            showToast(err.message || "Lỗi khi đổi mật khẩu", "error");
        } finally {
            setIsSaving(false);
        }
    };

    /* ──────────── RENDER ──────────── */
    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30">
            {/* ═══ HEADER ═══ */}
            <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
                    <button onClick={() => router.push("/home")} className="flex items-center gap-2.5 group">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-xl bg-cyan-400 blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
                            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg">
                                <span className="text-base font-black text-white">C</span>
                            </div>
                        </div>
                        <span className="text-lg font-extrabold tracking-tight">
                            Cloud<span className="text-cyan-400">Exam</span>
                        </span>
                    </button>

                    <nav className="hidden md:flex items-center gap-1">
                        {[
                            { label: "Trang chủ", route: "/home" },
                            { label: "Khoá học", route: "/courses" },
                            { label: "Đề thi", route: "/exams" },
                            { label: "Lịch sử", route: "/history" },
                        ].map((l) => (
                            <button
                                key={l.route}
                                onClick={() => router.push(l.route)}
                                className="px-4 py-2 text-[13px] font-medium rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                            >
                                {l.label}
                            </button>
                        ))}
                    </nav>

                    <button
                        onClick={() => router.back()}
                        className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/[0.06]"
                    >
                        ←
                    </button>
                </div>
            </header>

            {/* ═══ HERO ═══ */}
            <section className="relative overflow-hidden border-b border-white/[0.06] bg-gradient-to-b from-slate-900/50 to-slate-950">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-[400px] w-[700px] rounded-full bg-gradient-to-b from-cyan-600/15 to-transparent blur-3xl" />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-5 lg:px-8 pt-12 pb-10">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 opacity-50 blur-sm group-hover:opacity-80 transition-opacity" />
                            {avatarPreview ? (
                                <img
                                    src={avatarPreview}
                                    alt={fullName}
                                    className="relative h-24 w-24 rounded-full object-cover border-2 border-slate-950"
                                />
                            ) : (
                                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 border-2 border-slate-950">
                                    <span className="text-2xl font-black text-white">{initials}</span>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="text-center sm:text-left">
                            <h1 className="text-2xl font-extrabold sm:text-3xl">{fullName || "Chưa đặt tên"}</h1>
                            <p className="mt-1 text-sm text-slate-400">{profile?.email}</p>
                            <p className="mt-2 text-xs text-slate-500">
                                Thành viên từ {memberSince}
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Đề thi đã làm", value: stats?.totalExamsTaken ?? "—", icon: "📝", color: "from-cyan-500/15 to-blue-500/15 border-cyan-500/20" },
                            { label: "Điểm trung bình", value: stats ? `${stats.averageScore}%` : "—", icon: "📊", color: "from-green-500/15 to-emerald-500/15 border-green-500/20" },
                            { label: "Câu hỏi đã trả lời", value: stats?.totalQuestions?.toLocaleString() ?? "—", icon: "💡", color: "from-purple-500/15 to-pink-500/15 border-purple-500/20" },
                            { label: "Ghi chú", value: stats?.totalNotes ?? "—", icon: "📌", color: "from-amber-500/15 to-orange-500/15 border-amber-500/20" },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className={`rounded-2xl border bg-gradient-to-br p-5 ${stat.color}`}
                            >
                                <span className="text-xl">{stat.icon}</span>
                                <p className="mt-2 text-2xl font-extrabold text-white">{stat.value}</p>
                                <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ MAIN CONTENT ═══ */}
            <main className="mx-auto max-w-7xl px-5 lg:px-8 py-10">
                {/* Tab Switcher */}
                <div className="flex gap-1 p-1 rounded-xl bg-slate-900/60 border border-white/[0.06] mb-8 max-w-sm">
                    {([
                        { key: "info" as const, label: "Hồ sơ", icon: "👤" },
                        { key: "password" as const, label: "Mật khẩu", icon: "🔒" },
                    ]).map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${activeTab === tab.key
                                ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm"
                                : "text-slate-400 hover:text-slate-200"
                                }`}
                        >
                            <span className="text-sm">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── Tab: Profile Info ── */}
                {activeTab === "info" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* LEFT — Avatar Upload Card */}
                        <div className="lg:col-span-1">
                            <div className="rounded-2xl border border-white/[0.06] bg-slate-900/60 p-6 sm:p-8">
                                <h2 className="text-base font-bold text-white mb-6">Ảnh đại diện</h2>

                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />

                                {/* Preview */}
                                <div className="flex flex-col items-center gap-5">
                                    <div className="relative">
                                        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 opacity-30 blur-sm" />
                                        {avatarPreview ? (
                                            <img
                                                src={avatarPreview}
                                                alt={fullName}
                                                className="relative h-32 w-32 rounded-full object-cover border-3 border-slate-950"
                                            />
                                        ) : (
                                            <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-slate-700 border-3 border-slate-950">
                                                <span className="text-3xl font-black text-slate-500">{initials}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* File info */}
                                    {avatarFile && (
                                        <div className="text-center">
                                            <p className="text-xs text-slate-400 truncate max-w-[200px]">{avatarFile.name}</p>
                                            <p className="text-[11px] text-slate-600">{(avatarFile.size / 1024).toFixed(0)} KB</p>
                                        </div>
                                    )}

                                    {/* Buttons */}
                                    <div className="flex flex-col gap-2 w-full">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="w-full rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-400 hover:bg-cyan-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isUploading ? (
                                                <>
                                                    <div className="h-4 w-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                                                    Đang tải lên…
                                                </>
                                            ) : (
                                                <>📷 {avatarPreview ? "Đổi ảnh" : "Tải ảnh lên"}</>
                                            )}
                                        </button>
                                        {avatarPreview && (
                                            <button
                                                onClick={handleRemoveAvatar}
                                                className="w-full rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/15 transition-colors"
                                            >
                                                Xóa ảnh
                                            </button>
                                        )}
                                    </div>

                                    <p className="text-[11px] text-slate-600 text-center leading-relaxed">
                                        JPG, PNG hoặc WebP<br />Tối đa 5MB
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT — Profile Fields */}
                        <div className="lg:col-span-2">
                            <div className="rounded-2xl border border-white/[0.06] bg-slate-900/60 p-6 sm:p-8">
                                <h2 className="text-base font-bold text-white mb-6">Thông tin cá nhân</h2>

                                <div className="space-y-5">
                                    {/* Email (read-only) */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 mb-2">Email</label>
                                        <div className="rounded-xl border border-white/[0.06] bg-slate-950/60 px-4 py-3 text-sm text-slate-500 cursor-not-allowed">
                                            {profile?.email || "—"}
                                        </div>
                                        <p className="text-xs text-slate-600 mt-1.5">Email không thể thay đổi</p>
                                    </div>

                                    {/* Full Name */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 mb-2">Họ và tên</label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            maxLength={100}
                                            placeholder="Nhập họ và tên…"
                                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                                        />
                                    </div>

                                    {/* Member since (read-only) */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 mb-2">Ngày tham gia</label>
                                        <div className="rounded-xl border border-white/[0.06] bg-slate-950/60 px-4 py-3 text-sm text-slate-500 cursor-not-allowed">
                                            {memberSince}
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="mt-8 flex justify-end">
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isSaving}
                                        className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-600/20 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Đang lưu…
                                            </>
                                        ) : (
                                            "💾 Lưu thay đổi"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Tab: Change Password ── */}
                {activeTab === "password" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* LEFT — Password Form */}
                        <div className="lg:col-span-2">
                            <div className="rounded-2xl border border-white/[0.06] bg-slate-900/60 p-6 sm:p-8">
                                <h2 className="text-base font-bold text-white mb-2">Đổi mật khẩu</h2>
                                <p className="text-sm text-slate-500 mb-6">Mật khẩu mới phải có ít nhất 6 ký tự</p>

                                <div className="space-y-5">
                                    {/* Current Password */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 mb-2">Mật khẩu hiện tại</label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                                        />
                                    </div>

                                    {/* New Password */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 mb-2">Mật khẩu mới</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Tối thiểu 6 ký tự"
                                            minLength={6}
                                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                                        />
                                        {newPassword && newPassword.length < 6 && (
                                            <p className="text-xs text-red-400 mt-1.5">Mật khẩu phải có ít nhất 6 ký tự</p>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 mb-2">Xác nhận mật khẩu mới</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Nhập lại mật khẩu mới"
                                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                                        />
                                        {confirmPassword && newPassword !== confirmPassword && (
                                            <p className="text-xs text-red-400 mt-1.5">Mật khẩu xác nhận không khớp</p>
                                        )}
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="mt-8 flex justify-end">
                                    <button
                                        onClick={handleChangePassword}
                                        disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
                                        className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-600/20 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Đang xử lý…
                                            </>
                                        ) : (
                                            "🔐 Đổi mật khẩu"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT — Security tips */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
                                <div className="flex items-start gap-3">
                                    <span className="text-xl">⚡</span>
                                    <div>
                                        <h3 className="text-sm font-bold text-amber-400 mb-2">Lưu ý bảo mật</h3>
                                        <ul className="text-xs text-slate-400 space-y-2 leading-relaxed">
                                            <li>• Sử dụng mật khẩu mạnh kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                                            <li>• Không sử dụng lại mật khẩu từ các dịch vụ khác</li>
                                            <li>• Đổi mật khẩu định kỳ để tăng bảo mật</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">
                                <div className="flex items-start gap-3">
                                    <span className="text-xl">🛡️</span>
                                    <div>
                                        <h3 className="text-sm font-bold text-blue-400 mb-2">Mẹo tạo mật khẩu</h3>
                                        <ul className="text-xs text-slate-400 space-y-2 leading-relaxed">
                                            <li>• Dùng ít nhất 8 ký tự</li>
                                            <li>• Kết hợp: <span className="text-slate-300 font-mono">Aa1@</span></li>
                                            <li>• Ví dụ: <span className="text-slate-300 font-mono">Cloud@Exam2025</span></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Danger Zone ── */}
                <div className="mt-12 rounded-2xl border border-red-500/15 bg-red-500/5 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h3 className="text-sm font-bold text-red-400 mb-1">Đăng xuất</h3>
                            <p className="text-xs text-slate-400">Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng dịch vụ</p>
                        </div>
                        <button
                            onClick={() => {
                                // TODO: clear auth token & redirect
                                router.push("/login");
                            }}
                            className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-colors flex-shrink-0"
                        >
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </main>

            {/* ═══ TOAST ═══ */}
            {toast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className={`rounded-xl px-5 py-3 text-sm font-medium shadow-2xl backdrop-blur-xl ${toast.type === "success"
                        ? "bg-green-500/15 border border-green-500/30 text-green-400"
                        : "bg-red-500/15 border border-red-500/30 text-red-400"
                        }`}>
                        {toast.type === "success" ? "✓ " : "⚠ "}{toast.text}
                    </div>
                </div>
            )}
        </div>
    );
}
