"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

// Stats data
const stats = [
  { value: "50K+", label: "Active Users" },
  { value: "10K+", label: "Questions" },
  { value: "95%", label: "Pass Rate" },
  { value: "24/7", label: "Support" },
] as const;

// Features data
const features = [
  {
    icon: "📝",
    title: "Realistic Exams",
    desc: "Practice with questions that mirror the actual certification exams.",
    gradient: "from-orange-400 to-pink-500",
    bgGlow: "bg-orange-500/20",
  },
  {
    icon: "📊",
    title: "Smart Analytics",
    desc: "Track your progress and identify weak areas instantly.",
    gradient: "from-cyan-400 to-blue-500",
    bgGlow: "bg-cyan-500/20",
  },
  {
    icon: "⏰",
    title: "Timed Practice",
    desc: "Build exam confidence with realistic time constraints.",
    gradient: "from-green-400 to-emerald-500",
    bgGlow: "bg-green-500/20",
  },
  {
    icon: "✓",
    title: "Expert Explanations",
    desc: "Deep-dive into every answer with detailed walkthroughs.",
    gradient: "from-violet-400 to-purple-500",
    bgGlow: "bg-violet-500/20",
  },
  {
    icon: "📅",
    title: "Daily Updates",
    desc: "Fresh questions added regularly to keep you prepared.",
    gradient: "from-amber-400 to-orange-500",
    bgGlow: "bg-amber-500/20",
  },
  {
    icon: "👥",
    title: "Community",
    desc: "Join thousands of learners and share knowledge.",
    gradient: "from-rose-400 to-red-500",
    bgGlow: "bg-rose-500/20",
  },
] as const;

// Certifications data
const certifications = [
  {
    provider: "AWS",
    certs: ["Solutions Architect", "Developer Associate", "SysOps Admin"],
    color: "from-orange-400 to-amber-500",
    badge: "🔶",
  },
  {
    provider: "Azure",
    certs: ["AZ-900 Fundamentals", "AZ-104 Administrator", "AZ-204 Developer"],
    color: "from-blue-400 to-cyan-500",
    badge: "🔷",
  },
  {
    provider: "Google Cloud",
    certs: ["Associate Cloud Engineer", "Professional Architect", "Data Engineer"],
    color: "from-red-400 to-yellow-500",
    badge: "🔴",
  },
] as const;

// Testimonials data
const testimonials = [
  {
    name: "Minh Nguyen",
    role: "Cloud Engineer @ FPT",
    avatar: "M",
    content: "Passed AWS SAA on my first attempt! The practice exams were incredibly accurate.",
    rating: 5,
  },
  {
    name: "Linh Tran",
    role: "DevOps Lead @ Viettel",
    avatar: "L",
    content: "The detailed explanations helped me understand concepts I struggled with for months.",
    rating: 5,
  },
  {
    name: "Duc Pham",
    role: "Junior Developer",
    avatar: "D",
    content: "Best investment for my career. Got certified in just 3 weeks of practice!",
    rating: 5,
  },
] as const;

const LandingPage = () => {
  const router = useRouter();

  return (
    <div className="bg-slate-900 flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 overflow-y-auto">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 pt-10 pb-12">
          {/* Background decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-cyan-500/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-20 right-0 w-32 h-32 bg-blue-500/30 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute top-40 left-0 w-24 h-24 bg-purple-500/30 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 max-w-4xl mx-auto">
            {/* Main headline */}
            <h1 className="text-center text-white mb-3 text-3xl md:text-5xl font-black leading-tight">
              Master Cloud <br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Certifications
              </span>
            </h1>

            <p className="text-center text-slate-400 mb-8 px-2 leading-relaxed max-w-xl mx-auto">
              Join 50,000+ professionals who passed their AWS, Azure & GCP exams using our AI-powered practice platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-xs sm:max-w-md mx-auto">
              <button
                className="flex-1 rounded-xl py-3.5 text-base font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-xl shadow-cyan-500/25 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                onClick={() => router.push('/register')}
              >
                <span>▶</span>
                Start Free Trial
              </button>
              <button
                className="flex-1 rounded-xl py-3 text-base font-semibold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                onClick={() => router.push('/login')}
              >
                Explore Exams
              </button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-4 py-6 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <div className="grid grid-cols-4 gap-2">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <span className="text-cyan-400 font-black text-lg block">
                    {stat.value}
                  </span>
                  <span className="text-slate-400 text-xs">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 py-8 max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <span className="text-cyan-400 text-sm font-semibold uppercase tracking-wider mb-2 block">
              Features
            </span>
            <h2 className="text-white text-xl font-bold">
              Everything you need to pass
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="relative bg-slate-800/50 p-4 rounded-2xl border border-white/5 overflow-hidden group cursor-pointer transition-all duration-300 hover:border-white/20"
              >
                {/* Glow effect */}
                <div
                  className={`absolute -top-4 -right-4 w-20 h-20 ${feature.bgGlow} rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`}
                ></div>

                <div className="relative z-10">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-3 shadow-lg text-xl`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-white text-sm mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications Section */}
        <section className="px-4 py-8 max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <span className="text-cyan-400 text-sm font-semibold uppercase tracking-wider mb-2 block">
              Certifications
            </span>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              All major cloud platforms
            </h2>
          </div>

          <div className="space-y-4">
            {certifications.map((cert, idx) => (
              <div
                key={idx}
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-clr)' }}
              >
                {/* Header */}
                <div
                  className={`bg-gradient-to-r ${cert.color} p-4 flex items-center gap-3`}
                >
                  <span className="text-2xl">{cert.badge}</span>
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: '#ffffff' }}>
                      {cert.provider}
                    </h3>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      {cert.certs.length} certifications available
                    </p>
                  </div>
                </div>
                {/* Cert list */}
                <div className="p-3 space-y-2">
                  {cert.certs.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl px-4 py-3 cursor-pointer transition-colors"
                      style={{ backgroundColor: 'var(--surface-hover)' }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-green-400 text-sm">✓</span>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {c}
                        </span>
                      </div>
                      <span style={{ color: 'var(--text-muted)' }}>›</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="px-4 py-8 max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <span className="text-cyan-400 text-sm font-semibold uppercase tracking-wider mb-2 block">
              Testimonials
            </span>
            <h2 className="text-white text-xl font-bold">
              Loved by professionals
            </h2>
          </div>

          <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="min-w-[280px] bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-white/10 rounded-2xl p-5 snap-center"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-3">
                  {[...Array(t.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-sm">★</span>
                  ))}
                </div>
                {/* Quote */}
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  &quot;{t.content}&quot;
                </p>
                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                    <span className="text-white font-bold">{t.avatar}</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">
                      {t.name}
                    </h4>
                    <p className="text-slate-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="px-4 py-10 mb-8 max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-3xl p-6 text-center overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-cyan-400/30 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10">
              <h2 className="text-white text-xl font-bold mb-2">
                Start your journey today
              </h2>
              <p className="text-slate-300 text-sm mb-6">
                Get access to 10,000+ questions across AWS, Azure & GCP.
              </p>
              <button
                className="rounded-xl py-3 px-8 text-base font-bold bg-white text-slate-900 shadow-xl hover:bg-slate-100 transition-colors"
                onClick={() => router.push('/register')}
              >
                Get Started — It&apos;s Free
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-6 border-t border-white/5">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">C</span>
            </div>
            <span className="text-white font-semibold">CloudExam</span>
          </div>
          <p className="text-center text-slate-500 text-xs">
            © 2024 CloudExam. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;
