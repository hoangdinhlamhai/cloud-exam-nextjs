"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/api";
import { profileService } from "@/services/profile";
import { useTheme } from "@/components/ThemeProvider";

const navLinks = [
  { key: "courses", label: "Khoá học", icon: "📚", route: "/courses" },
  { key: "exams", label: "Đề thi", icon: "📝", route: "/exams" },
  { key: "history", label: "Lịch sử", icon: "📊", route: "/history" },
  { key: "notes", label: "Ghi chú", icon: "📒", route: "/notes" },
] as const;

const stats = [
  { value: "10K+", label: "Câu hỏi", icon: "📝" },
  { value: "95%", label: "Tỷ lệ đạt", icon: "✅" },
  { value: "120+", label: "Bộ đề", icon: "📋" },
  { value: "3", label: "Nền tảng cloud", icon: "☁️" },
] as const;

const services = [
  { icon: "🎓", title: "Khoá học đầy đủ", desc: "Bao quát AWS, Azure & GCP với nội dung được cập nhật liên tục theo blueprint mới nhất.", route: "/courses" },
  { icon: "📝", title: "Đề thi thực chiến", desc: "Hàng trăm câu hỏi mô phỏng sát kì thi thật. Giải thích chi tiết cho mỗi đáp án.", route: "/exams" },
  { icon: "📊", title: "Theo dõi tiến độ", desc: "Dashboard phân tích chi tiết điểm mạnh, yếu giúp bạn tối ưu thời gian ôn tập.", route: "/history" },
  { icon: "📒", title: "Ghi chú thông minh", desc: "Lưu trữ và tổ chức kiến thức theo từng chủ đề, dễ dàng ôn tập mọi lúc.", route: "/notes" },
] as const;

const providers = [
  { name: "Amazon Web Services", short: "AWS", logo: "🔶", certs: ["Solutions Architect", "Developer Associate", "SysOps Admin", "Cloud Practitioner"] },
  { name: "Microsoft Azure", short: "Azure", logo: "🔷", certs: ["AZ-900 Fundamentals", "AZ-104 Admin", "AZ-204 Developer", "AZ-305 Architect"] },
  { name: "Google Cloud Platform", short: "GCP", logo: "🔴", certs: ["Cloud Digital Leader", "Associate Cloud Engineer", "Professional Architect"] },
] as const;

const testimonials = [
  { quote: "Đậu AWS SAA ngay lần thi đầu! Đề thi trên CloudExam sát thực tế hơn bất kỳ nguồn nào tôi từng dùng.", name: "Minh Nguyễn", role: "Cloud Engineer @ FPT Software", avatar: "M" },
  { quote: "Giải thích chi tiết giúp tôi hiểu sâu thay vì chỉ học thuộc. Rất recommend!", name: "Linh Trần", role: "DevOps Lead @ Viettel IDC", avatar: "L" },
  { quote: "Từ số 0, chỉ sau 3 tuần luyện trên CloudExam tôi đã đạt AZ-900. Quá tuyệt!", name: "Đức Phạm", role: "Junior Developer", avatar: "Đ" },
] as const;

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button onClick={toggleTheme} className="theme-button flex h-9 w-9 items-center justify-center rounded-lg text-base" title={isDark ? "Chuyển sang Light Mode" : "Chuyển sang Dark Mode"} aria-label={isDark ? "Chuyển sang Light Mode" : "Chuyển sang Dark Mode"}>
      {isDark ? "☀" : "☾"}
    </button>
  );
};

interface UserProfile {
  fullName: string | null;
  avatarUrl: string | null;
  email: string;
}

const HomePage = () => {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const heroRef = useRef<HTMLElement>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await profileService.getProfile();
      setProfile(data);
    } catch {
      // silently fail — avatar will show fallback
    }
  }, []);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    fetchProfile();
  }, [router, fetchProfile]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const avatarInitials = (profile?.fullName || profile?.email || "U").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="app-shell min-h-screen">
      <header className={`site-header fixed inset-x-0 top-0 z-50 ${scrolled ? "shadow-sm" : ""}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
          <button onClick={() => router.push("/home")} className="flex items-center gap-2 rounded-lg" aria-label="CloudExam home">
            <span className="brand-mark flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold">C</span>
            <span className="wordmark text-lg font-bold tracking-tight">Cloud<span className="wordmark-accent">Exam</span></span>
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <button key={link.key} onClick={() => router.push(link.route)} className="nav-link flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium">
                <span>{link.icon}</span><span>{link.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={() => router.push("/profile")} className="brand-mark flex h-9 w-9 items-center justify-center overflow-hidden rounded-full text-xs font-bold" aria-label="Open profile">
              {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="Avatar" className="h-full w-full object-cover" /> : <span>{avatarInitials}</span>}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="icon-button flex h-9 w-9 items-center justify-center rounded-lg md:hidden" aria-label="Toggle navigation menu">
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-nav px-5 pb-4 pt-2 md:hidden">
            {navLinks.map((link) => (
              <button key={link.key} onClick={() => { router.push(link.route); setMobileMenuOpen(false); }} className="nav-link flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium">
                <span className="text-lg">{link.icon}</span>{link.label}
              </button>
            ))}
            <button onClick={() => { router.push("/exams"); setMobileMenuOpen(false); }} className="primary-action mt-2 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold"><span>▶</span> Luyện đề ngay</button>
          </div>
        )}
      </header>

      <main className="pt-16">
        <section ref={heroRef} className="border-b" style={{ borderColor: "var(--border-clr)" }}>
          <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
            <div className="max-w-3xl">
              <div className="status-badge mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /><span className="text-xs font-semibold">Nền tảng luyện thi Cloud #1 Việt Nam</span></div>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl" style={{ color: "var(--text-primary)" }}>Chinh phục chứng chỉ <span className="wordmark-accent">Cloud</span> cùng CloudExam</h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed sm:text-lg" style={{ color: "var(--text-secondary)" }}>Luyện tập với hàng nghìn câu hỏi sát kì thi AWS, Azure & GCP. Theo dõi tiến độ, nhận phân tích chi tiết và đạt chứng chỉ ngay lần thi đầu.</p>
              <div className="mt-8"><button onClick={() => router.push("/courses")} className="primary-action inline-flex items-center gap-2 rounded-lg px-6 py-3.5 text-sm font-semibold"><span>▶</span> Khám phá khoá học</button></div>
              <div className="mt-10 flex items-center gap-4"><div className="flex -space-x-2">{["M", "L", "Đ", "+"].map((initial) => <div key={initial} className="brand-mark flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold" style={{ borderColor: "var(--background)" }}>{initial}</div>)}</div><div><p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>50,000+ học viên</p><p className="text-xs" style={{ color: "var(--text-muted)" }}>đã tin tưởng sử dụng CloudExam</p></div></div>
            </div>
          </div>
        </section>

        <section className="border-b" style={{ borderColor: "var(--border-clr)" }}><div className="mx-auto grid max-w-7xl grid-cols-2 sm:grid-cols-4"><>{stats.map((s) => <div key={s.label} className="border-r p-6 text-center last:border-r-0" style={{ borderColor: "var(--border-clr)" }}><span className="block text-xl">{s.icon}</span><span className="wordmark-accent mt-1 block text-xl font-bold">{s.value}</span><span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{s.label}</span></div>)}</></div></section>

        <section className="py-16 lg:py-20"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="mb-10 max-w-2xl"><p className="app-eyebrow mb-3 text-xs font-semibold uppercase tracking-[0.2em]">Tính năng</p><h2 className="text-3xl font-bold sm:text-4xl" style={{ color: "var(--text-primary)" }}>Mọi thứ bạn cần để <span className="wordmark-accent">đậu chứng chỉ</span></h2><p className="mt-4 leading-relaxed" style={{ color: "var(--text-secondary)" }}>Hệ thống luyện thi toàn diện — từ câu hỏi thực chiến cho đến phân tích chi tiết và ghi chú cá nhân.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{services.map((s) => <div key={s.title} onClick={() => router.push(s.route)} className="surface-card cursor-pointer rounded-xl p-5"><span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg text-xl" style={{ background: "var(--primary-soft)" }}>{s.icon}</span><h3 className="mb-2 text-base font-bold" style={{ color: "var(--text-primary)" }}>{s.title}</h3><p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{s.desc}</p><span className="app-link mt-5 block text-xs font-semibold">Khám phá →</span></div>)}</div></div></section>

        <section className="border-y py-16 lg:py-20" style={{ borderColor: "var(--border-clr)" }}><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="mb-10 text-center"><p className="app-eyebrow mb-3 text-xs font-semibold uppercase tracking-[0.2em]">Nền tảng</p><h2 className="text-3xl font-bold sm:text-4xl" style={{ color: "var(--text-primary)" }}>Bao quát <span className="wordmark-accent">3 nhà cung cấp Cloud</span> lớn nhất</h2></div><div className="grid gap-4 md:grid-cols-3">{providers.map((p) => <div key={p.short} className="surface-card overflow-hidden rounded-xl"><div className="flex items-center gap-3 border-b px-5 py-4" style={{ borderColor: "var(--border-clr)" }}><span className="text-3xl">{p.logo}</span><div><h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{p.short}</h3><p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.name}</p></div></div><ul className="p-2">{p.certs.map((c) => <li key={c} onClick={() => router.push("/courses")} className="nav-link flex cursor-pointer items-center justify-between rounded-lg px-3 py-3 text-sm"><span className="flex items-center gap-2"><span className="text-blue-600">•</span>{c}</span><span>›</span></li>)}</ul></div>)}</div></div></section>

        <section className="py-16 lg:py-20"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="mb-10 text-center"><p className="app-eyebrow mb-3 text-xs font-semibold uppercase tracking-[0.2em]">Đánh giá</p><h2 className="text-3xl font-bold sm:text-4xl" style={{ color: "var(--text-primary)" }}>Được tin tưởng bởi <span className="wordmark-accent">hàng nghìn chuyên gia</span></h2></div><div className="grid gap-4 md:grid-cols-3">{testimonials.map((t) => <div key={t.name} className="surface-card flex flex-col rounded-xl p-5"><div className="mb-4 text-sm text-amber-500">★★★★★</div><p className="flex-1 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>&ldquo;{t.quote}&rdquo;</p><div className="mt-5 flex items-center gap-3 border-t pt-4" style={{ borderColor: "var(--border-clr)" }}><div className="brand-mark flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold">{t.avatar}</div><div><p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.name}</p><p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.role}</p></div></div></div>)}</div></div></section>

        <section className="border-t py-16 lg:py-20" style={{ borderColor: "var(--border-clr)" }}><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="rounded-xl border p-8 text-center lg:p-12" style={{ background: "var(--primary-soft)", borderColor: "var(--primary-soft-border)" }}><h2 className="text-3xl font-bold sm:text-4xl" style={{ color: "var(--text-primary)" }}>Sẵn sàng chinh phục Cloud?</h2><p className="mx-auto mt-4 max-w-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>Bắt đầu luyện tập ngay hôm nay với hơn 10,000 câu hỏi AWS, Azure & GCP. Hoàn toàn miễn phí.</p></div></div></section>
      </main>

      <footer className="border-t py-10" style={{ borderColor: "var(--border-clr)" }}><div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-5 md:flex-row md:justify-between lg:px-8"><div className="flex items-center gap-2"><span className="brand-mark flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold">C</span><span className="wordmark text-sm font-bold">Cloud<span className="wordmark-accent">Exam</span></span></div><nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">{navLinks.map((l) => <button key={l.key} onClick={() => router.push(l.route)} className="footer-link text-xs">{l.label}</button>)}</nav><p className="text-xs" style={{ color: "var(--text-muted)" }}>© {new Date().getFullYear()} CloudExam. All rights reserved.</p></div></footer>
    </div>
  );
};

export default HomePage;
