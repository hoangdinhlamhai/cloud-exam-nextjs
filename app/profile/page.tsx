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
        <div className="app-shell">
            {/* ═══ HEADER ═══ */}
            <header className="site-header sticky top-0 z-50">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
                    <button onClick={() => router.push("/home")} className="flex items-center gap-2.5 rounded-lg px-1 py-1">
                        <div className="brand-mark flex h-9 w-9 items-center justify-center rounded-lg">
                            <span className="text-base font-black">C</span>
                        </div>
                        <span className="wordmark text-lg font-extrabold tracking-tight">
                            Cloud<span className="wordmark-accent">Exam</span>
                        </span>
                    </button>

                    <nav className="hidden items-center gap-1 md:flex">
                        {[
                            { label: "Trang chủ", route: "/home" },
                            { label: "Khoá học", route: "/courses" },
                            { label: "Đề thi", route: "/exams" },
                            { label: "Lịch sử", route: "/history" },
                        ].map((l) => (
                            <button
                                key={l.route}
                                onClick={() => router.push(l.route)}
                                className="nav-link rounded-lg px-4 py-2 text-[13px] font-medium"
                            >
                                {l.label}
                            </button>
                        ))}
                    </nav>

                    <button
                        onClick={() => router.back()}
                        className="icon-button flex h-9 w-9 items-center justify-center rounded-lg md:hidden"
                        aria-label="Quay lại"
                    >
                        ←
                    </button>
                </div>
            </header>

            {/* ═══ PROFILE SUMMARY ═══ */}
            <section className="border-b border-[var(--border-clr)]">
                <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
                    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                        {/* Avatar */}
                        <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--border-strong)] bg-[var(--surface-hover)]">
                            {avatarPreview ? (
                                <img
                                    src={avatarPreview}
                                    alt={fullName}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-2xl font-bold text-[var(--text-secondary)]">{initials}</span>
                            )}
                        </div>

                        {/* Info */}
                        <div className="text-center sm:text-left">
                            <p className="app-eyebrow text-sm font-semibold">Hồ sơ học viên</p>
                            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">{fullName || "Chưa đặt tên"}</h1>
                            <p className="mt-1 text-sm text-[var(--text-secondary)]">{profile?.email}</p>
                            <p className="mt-2 text-xs text-[var(--text-muted)]">
                                Thành viên từ {memberSince}
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
                        {[
                            { label: "Đề thi đã làm", value: stats?.totalExamsTaken ?? "—", icon: "📝" },
                            { label: "Điểm trung bình", value: stats ? `${stats.averageScore}%` : "—", icon: "📊" },
                            { label: "Câu hỏi đã trả lời", value: stats?.totalQuestions?.toLocaleString() ?? "—", icon: "💡" },
                            { label: "Ghi chú", value: stats?.totalNotes ?? "—", icon: "📌" },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="surface-card rounded-lg p-4"
                            >
                                <span className="text-lg" aria-hidden="true">{stat.icon}</span>
                                <p className="mt-2 text-2xl font-bold tabular-nums text-[var(--text-primary)]">{stat.value}</p>
                                <p className="mt-1 text-sm text-[var(--text-muted)]">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ MAIN CONTENT ═══ */}
            <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
                {/* Tab Switcher */}
                <div className="mb-8 flex max-w-sm gap-1 rounded-lg border border-[var(--border-clr)] bg-[var(--surface-hover)] p-1">
                    {([
                        { key: "info" as const, label: "Hồ sơ", icon: "👤" },
                        { key: "password" as const, label: "Mật khẩu", icon: "🔒" },
                    ]).map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${activeTab === tab.key
                                ? "border border-[var(--primary-soft-border)] bg-[var(--surface)] text-[var(--primary)] shadow-sm"
                                : "text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
                                }`}
                        >
                            <span className="text-sm" aria-hidden="true">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── Tab: Profile Info ── */}
                {activeTab === "info" && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* LEFT — Avatar Upload Card */}
                        <div className="lg:col-span-1">
                            <div className="surface-card rounded-xl p-6 sm:p-8">
                                <h2 className="mb-6 text-base font-bold text-[var(--text-primary)]">Ảnh đại diện</h2>

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
                                    <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--border-strong)] bg-[var(--surface-hover)]">
                                        {avatarPreview ? (
                                            <img
                                                src={avatarPreview}
                                                alt={fullName}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-3xl font-bold text-[var(--text-secondary)]">{initials}</span>
                                        )}
                                    </div>

                                    {/* File info */}
                                    {avatarFile && (
                                        <div className="text-center">
                                            <p className="max-w-[200px] truncate text-xs text-[var(--text-secondary)]">{avatarFile.name}</p>
                                            <p className="text-[11px] text-[var(--text-muted)]">{(avatarFile.size / 1024).toFixed(0)} KB</p>
                                        </div>
                                    )}

                                    {/* Buttons */}
                                    <div className="flex w-full flex-col gap-2">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="secondary-action flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
                                        >
                                            {isUploading ? (
                                                <>
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
                                                    Đang tải lên…
                                                </>
                                            ) : (
                                                <>📷 {avatarPreview ? "Đổi ảnh" : "Tải ảnh lên"}</>
                                            )}
                                        </button>
                                        {avatarPreview && (
                                            <button
                                                onClick={handleRemoveAvatar}
                                                className="w-full rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-red-500/15"
                                                style={{ color: "light-dark(#b91c1c, #fca5a5)" }}
                                            >
                                                Xóa ảnh
                                            </button>
                                        )}
                                    </div>

                                    <p className="text-center text-[11px] leading-relaxed text-[var(--text-muted)]">
                                        JPG, PNG hoặc WebP<br />Tối đa 5MB
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT — Profile Fields */}
                        <div className="lg:col-span-2">
                            <div className="surface-card rounded-xl p-6 sm:p-8">
                                <h2 className="mb-6 text-base font-bold text-[var(--text-primary)]">Thông tin cá nhân</h2>

                                <div className="space-y-5">
                                    {/* Email (read-only) */}
                                    <div>
                                        <label className="form-label mb-2 block text-xs font-semibold">Email</label>
                                        <div className="surface-subtle cursor-not-allowed rounded-lg border border-[var(--border-clr)] px-4 py-3 text-sm text-[var(--text-muted)]">
                                            {profile?.email || "—"}
                                        </div>
                                        <p className="mt-1.5 text-xs text-[var(--text-muted)]">Email không thể thay đổi</p>
                                    </div>

                                    {/* Full Name */}
                                    <div>
                                        <label className="form-label mb-2 block text-xs font-semibold">Họ và tên</label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            maxLength={100}
                                            placeholder="Nhập họ và tên…"
                                            className="form-input w-full rounded-lg px-4 py-3 text-sm"
                                        />
                                    </div>

                                    {/* Member since (read-only) */}
                                    <div>
                                        <label className="form-label mb-2 block text-xs font-semibold">Ngày tham gia</label>
                                        <div className="surface-subtle cursor-not-allowed rounded-lg border border-[var(--border-clr)] px-4 py-3 text-sm text-[var(--text-muted)]">
                                            {memberSince}
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="mt-8 flex justify-end">
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isSaving}
                                        className="primary-action flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold"
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* LEFT — Password Form */}
                        <div className="lg:col-span-2">
                            <div className="surface-card rounded-xl p-6 sm:p-8">
                                <h2 className="mb-2 text-base font-bold text-[var(--text-primary)]">Đổi mật khẩu</h2>
                                <p className="mb-6 text-sm text-[var(--text-muted)]">Mật khẩu mới phải có ít nhất 6 ký tự</p>

                                <div className="space-y-5">
                                    {/* Current Password */}
                                    <div>
                                        <label className="form-label mb-2 block text-xs font-semibold">Mật khẩu hiện tại</label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="form-input w-full rounded-lg px-4 py-3 text-sm"
                                        />
                                    </div>

                                    {/* New Password */}
                                    <div>
                                        <label className="form-label mb-2 block text-xs font-semibold">Mật khẩu mới</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Tối thiểu 6 ký tự"
                                            minLength={6}
                                            className="form-input w-full rounded-lg px-4 py-3 text-sm"
                                        />
                                        {newPassword && newPassword.length < 6 && (
                                            <p className="mt-1.5 text-xs" style={{ color: "light-dark(#b91c1c, #fca5a5)" }}>Mật khẩu phải có ít nhất 6 ký tự</p>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="form-label mb-2 block text-xs font-semibold">Xác nhận mật khẩu mới</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Nhập lại mật khẩu mới"
                                            className="form-input w-full rounded-lg px-4 py-3 text-sm"
                                        />
                                        {confirmPassword && newPassword !== confirmPassword && (
                                            <p className="mt-1.5 text-xs" style={{ color: "light-dark(#b91c1c, #fca5a5)" }}>Mật khẩu xác nhận không khớp</p>
                                        )}
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="mt-8 flex justify-end">
                                    <button
                                        onClick={handleChangePassword}
                                        disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
                                        className="primary-action flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold"
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
                        <div className="space-y-6 lg:col-span-1">
                            <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 p-6">
                                <div className="flex items-start gap-3">
                                    <span className="text-xl" aria-hidden="true">⚡</span>
                                    <div>
                                        <h3 className="mb-2 text-sm font-bold" style={{ color: "light-dark(#92400e, #fcd34d)" }}>Lưu ý bảo mật</h3>
                                        <ul className="space-y-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                                            <li>• Sử dụng mật khẩu mạnh kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                                            <li>• Không sử dụng lại mật khẩu từ các dịch vụ khác</li>
                                            <li>• Đổi mật khẩu định kỳ để tăng bảo mật</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="surface-card rounded-xl p-6">
                                <div className="flex items-start gap-3">
                                    <span className="text-xl" aria-hidden="true">🛡️</span>
                                    <div>
                                        <h3 className="mb-2 text-sm font-bold text-[var(--text-primary)]">Mẹo tạo mật khẩu</h3>
                                        <ul className="space-y-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                                            <li>• Dùng ít nhất 8 ký tự</li>
                                            <li>• Kết hợp: <span className="font-mono text-[var(--text-primary)]">Aa1@</span></li>
                                            <li>• Ví dụ: <span className="font-mono text-[var(--text-primary)]">Cloud@Exam2025</span></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Danger Zone ── */}
                <div className="mt-12 rounded-xl border border-red-500/30 bg-red-500/10 p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="mb-1 text-sm font-bold" style={{ color: "light-dark(#b91c1c, #fca5a5)" }}>Đăng xuất</h3>
                            <p className="text-xs text-[var(--text-secondary)]">Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng dịch vụ</p>
                        </div>
                        <button
                            onClick={() => {
                                // TODO: clear auth token & redirect
                                router.push("/login");
                            }}
                            className="flex-shrink-0 rounded-lg border border-red-500/35 bg-[var(--surface)] px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-red-500/10"
                            style={{ color: "light-dark(#b91c1c, #fca5a5)" }}
                        >
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </main>

            {/* ═══ TOAST ═══ */}
            {toast && (
                <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2">
                    <div className={`rounded-lg border px-5 py-3 text-sm font-medium shadow-sm ${toast.type === "success"
                        ? "border-green-500/30 bg-green-500/10"
                        : "border-red-500/30 bg-red-500/10"
                        }`} style={{ color: toast.type === "success" ? "light-dark(#15803d, #86efac)" : "light-dark(#b91c1c, #fca5a5)" }}>
                        {toast.type === "success" ? "✓ " : "⚠ "}{toast.text}
                    </div>
                </div>
            )}
        </div>
    );
}
