"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/api";

/* ───────── DATA ───────── */

const navLinks = [
  { key: "courses", label: "Khoá học", route: "/courses" },
  { key: "exams", label: "Đề thi", route: "/exams" },
  { key: "history", label: "Lịch sử", route: "/history" },
  { key: "notes", label: "Ghi chú", route: "/notes" },
] as const;

const stats = [
  { value: "10K+", label: "Câu hỏi", icon: "📝" },
  { value: "95%", label: "Tỷ lệ đạt", icon: "✅" },
  { value: "120+", label: "Bộ đề", icon: "📋" },
  { value: "3", label: "Nền tảng cloud", icon: "☁️" },
] as const;

const services = [
  {
    icon: "🎓",
    title: "Khoá học đầy đủ",
    desc: "Bao quát AWS, Azure & GCP với nội dung được cập nhật liên tục theo blueprint mới nhất.",
    gradient: "from-blue-500 to-indigo-600",
    route: "/courses",
  },
  {
    icon: "📝",
    title: "Đề thi thực chiến",
    desc: "Hàng trăm câu hỏi mô phỏng sát kì thi thật. Giải thích chi tiết cho mỗi đáp án.",
    gradient: "from-cyan-500 to-teal-500",
    route: "/exams",
  },
  {
    icon: "📊",
    title: "Theo dõi tiến độ",
    desc: "Dashboard phân tích chi tiết điểm mạnh, yếu giúp bạn tối ưu thời gian ôn tập.",
    gradient: "from-purple-500 to-pink-500",
    route: "/history",
  },
  {
    icon: "📒",
    title: "Ghi chú thông minh",
    desc: "Lưu trữ và tổ chức kiến thức theo từng chủ đề, dễ dàng ôn tập mọi lúc.",
    gradient: "from-emerald-500 to-green-500",
    route: "/notes",
  },
] as const;

const providers = [
  {
    name: "Amazon Web Services",
    short: "AWS",
    logo: "🔶",
    color: "from-orange-500 to-amber-400",
    certs: ["Solutions Architect", "Developer Associate", "SysOps Admin", "Cloud Practitioner"],
  },
  {
    name: "Microsoft Azure",
    short: "Azure",
    logo: "🔷",
    color: "from-blue-500 to-cyan-400",
    certs: ["AZ-900 Fundamentals", "AZ-104 Admin", "AZ-204 Developer", "AZ-305 Architect"],
  },
  {
    name: "Google Cloud Platform",
    short: "GCP",
    logo: "🔴",
    color: "from-red-500 to-yellow-400",
    certs: ["Cloud Digital Leader", "Associate Cloud Engineer", "Professional Architect"],
  },
] as const;

const testimonials = [
  {
    quote: "Đậu AWS SAA ngay lần thi đầu! Đề thi trên CloudExam sát thực tế hơn bất kỳ nguồn nào tôi từng dùng.",
    name: "Minh Nguyễn",
    role: "Cloud Engineer @ FPT Software",
    avatar: "M",
  },
  {
    quote: "Giải thích chi tiết giúp tôi hiểu sâu thay vì chỉ học thuộc. Rất recommend!",
    name: "Linh Trần",
    role: "DevOps Lead @ Viettel IDC",
    avatar: "L",
  },
  {
    quote: "Từ số 0, chỉ sau 3 tuần luyện trên CloudExam tôi đã đạt AZ-900. Quá tuyệt!",
    name: "Đức Phạm",
    role: "Junior Developer",
    avatar: "Đ",
  },
] as const;

/* ───────── COMPONENT ───────── */

const HomePage = () => {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  // Check auth
  useEffect(() => {
    const token = getAuthToken();
    if (!token) router.replace("/login");
  }, [router]);

  // Shrink header on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30">
      {/* ════════════════ HEADER ════════════════ */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled
            ? "bg-slate-950/80 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20"
            : "bg-transparent"
          }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
          {/* Logo */}
          <button
            onClick={() => router.push("/home")}
            className="flex items-center gap-2.5 group"
          >
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

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.key}
                onClick={() => router.push(link.route)}
                className="relative px-4 py-2 text-[13px] font-medium text-slate-300 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/exams")}
              className="hidden sm:flex items-center gap-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/25 px-3.5 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/25 transition-colors"
            >
              <span className="text-sm">▶</span>
              Luyện đề
            </button>

            {/* Avatar */}
            <button
              onClick={() => router.push("/history")}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-bold ring-2 ring-cyan-500/20 hover:ring-cyan-500/40 transition-all"
            >
              U
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/[0.06]"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.06] bg-slate-950/95 backdrop-blur-xl px-5 pb-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => (
              <button
                key={link.key}
                onClick={() => {
                  router.push(link.route);
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2.5 text-sm font-medium text-slate-300 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                router.push("/exams");
                setMobileMenuOpen(false);
              }}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-bold text-white"
            >
              <span>▶</span> Luyện đề ngay
            </button>
          </div>
        )}
      </header>

      {/* ════════════════ HERO ════════════════ */}
      <section ref={heroRef} className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28">
        {/* Animated bg blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-gradient-to-b from-cyan-600/20 via-blue-600/10 to-transparent blur-3xl" />
          <div className="absolute top-32 right-0 h-64 w-64 rounded-full bg-purple-500/15 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-10 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-medium text-cyan-300">Nền tảng luyện thi Cloud #1 Việt Nam</span>
            </div>

            <h1 className="text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Chinh phục chứng chỉ{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Cloud
              </span>{" "}
              cùng CloudExam
            </h1>

            <p className="mt-5 max-w-xl text-base text-slate-400 leading-relaxed sm:text-lg">
              Luyện tập với hàng nghìn câu hỏi sát kì thi AWS, Azure & GCP. Theo dõi tiến độ, nhận phân tích
              chi tiết và đạt chứng chỉ ngay lần thi đầu.
            </p>

            {/* CTA row */}
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => router.push("/exams")}
                className="group relative rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-600/25 transition-all hover:shadow-xl hover:shadow-cyan-600/30 hover:-translate-y-0.5"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>▶</span> Bắt đầu luyện đề
                </span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
              <button
                onClick={() => router.push("/courses")}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-slate-200 transition-all hover:bg-white/[0.08] hover:border-white/20"
              >
                Khám phá khoá học
              </button>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2">
                {["bg-cyan-500", "bg-blue-500", "bg-purple-500", "bg-pink-500"].map((c, i) => (
                  <div
                    key={i}
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${c} text-xs font-bold ring-2 ring-slate-950`}
                  >
                    {["M", "L", "Đ", "+"][i]}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">50,000+ học viên</p>
                <p className="text-xs text-slate-500">đã tin tưởng sử dụng CloudExam</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ STATS BAR ════════════════ */}
      <section className="relative border-y border-white/[0.06] bg-slate-900/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px sm:grid-cols-4 lg:px-8">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1 py-7 px-4 bg-slate-950/60">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-xl font-black text-cyan-400">{s.value}</span>
              <span className="text-xs text-slate-500 font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════ SERVICES / FEATURES ════════════════ */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          {/* Section heading */}
          <div className="mb-14 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400 mb-3">Tính năng</p>
            <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
              Mọi thứ bạn cần để <span className="text-cyan-400">đậu chứng chỉ</span>
            </h2>
            <p className="mt-4 text-slate-400 leading-relaxed">
              Hệ thống luyện thi toàn diện — từ câu hỏi thực chiến cho đến phân tích chi tiết và ghi chú cá nhân.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <div
                key={s.title}
                onClick={() => router.push(s.route)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/[0.06] bg-slate-900/60 p-6 transition-all duration-300 hover:border-white/[0.12] hover:bg-slate-900/80 hover:-translate-y-1"
              >
                {/* Hover glow */}
                <div className={`absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br ${s.gradient} opacity-0 blur-3xl transition-opacity group-hover:opacity-20`} />

                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradient} text-2xl shadow-lg`}>
                  {s.icon}
                </div>
                <h3 className="mb-2 text-base font-bold text-white">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>

                <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-cyan-400 opacity-0 translate-x-0 transition-all group-hover:opacity-100">
                  Khám phá <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ CLOUD PROVIDERS ════════════════ */}
      <section className="py-20 lg:py-28 border-t border-white/[0.06] bg-gradient-to-b from-slate-950 to-slate-900/50">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-14 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400 mb-3">Nền tảng</p>
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Bao quát <span className="text-cyan-400">3 nhà cung cấp Cloud</span> lớn nhất
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {providers.map((p) => (
              <div
                key={p.short}
                className="group rounded-2xl border border-white/[0.06] bg-slate-900/50 overflow-hidden transition-all hover:border-white/[0.12] hover:-translate-y-1"
              >
                {/* Header stripe */}
                <div className={`bg-gradient-to-r ${p.color} px-6 py-5 flex items-center gap-3`}>
                  <span className="text-3xl">{p.logo}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{p.short}</h3>
                    <p className="text-xs text-white/75">{p.name}</p>
                  </div>
                </div>
                {/* Certs list */}
                <ul className="divide-y divide-white/[0.04] p-2">
                  {p.certs.map((c) => (
                    <li
                      key={c}
                      className="flex items-center justify-between rounded-lg px-4 py-3 text-sm text-slate-300 hover:bg-white/[0.04] transition-colors cursor-pointer"
                      onClick={() => router.push("/courses")}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-cyan-500 text-xs">✦</span>
                        {c}
                      </span>
                      <span className="text-slate-600 group-hover:text-slate-400 transition-colors">›</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ TESTIMONIALS ════════════════ */}
      <section className="py-20 lg:py-28 border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-14 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400 mb-3">Đánh giá</p>
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Được tin tưởng bởi <span className="text-cyan-400">hàng nghìn chuyên gia</span>
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-white/[0.06] bg-slate-900/50 p-6 flex flex-col"
              >
                {/* Stars */}
                <div className="mb-4 flex gap-0.5 text-amber-400 text-sm">
                  {"★★★★★"}
                </div>
                <p className="flex-1 text-sm text-slate-300 leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ CTA BANNER ════════════════ */}
      <section className="py-20 lg:py-28 border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-600/20 via-blue-600/20 to-purple-600/20 border border-cyan-500/20 p-10 text-center lg:p-16">
            {/* Glow */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-60 w-60 rounded-full bg-cyan-500/25 blur-[100px]" />
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl font-extrabold sm:text-4xl">
                Sẵn sàng chinh phục Cloud?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-slate-300 leading-relaxed">
                Bắt đầu luyện tập ngay hôm nay với hơn 10,000 câu hỏi AWS, Azure & GCP.
                Hoàn toàn miễn phí.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => router.push("/exams")}
                  className="rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-slate-900 shadow-xl hover:bg-slate-100 transition-colors"
                >
                  Bắt đầu ngay — Miễn phí
                </button>
                <button
                  onClick={() => router.push("/courses")}
                  className="rounded-xl border border-white/15 bg-white/[0.06] px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/[0.1] transition-colors"
                >
                  Xem lộ trình
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer className="border-t border-white/[0.06] bg-slate-950 py-12">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600">
                <span className="text-xs font-black text-white">C</span>
              </div>
              <span className="text-sm font-bold">
                Cloud<span className="text-cyan-400">Exam</span>
              </span>
            </div>

            {/* Links */}
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {navLinks.map((l) => (
                <button
                  key={l.key}
                  onClick={() => router.push(l.route)}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {l.label}
                </button>
              ))}
            </nav>

            <p className="text-xs text-slate-600">
              © {new Date().getFullYear()} CloudExam. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
