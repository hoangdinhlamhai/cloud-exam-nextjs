"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

const stats = [
  { value: "50K+", label: "Active Users" },
  { value: "10K+", label: "Questions" },
  { value: "95%", label: "Pass Rate" },
  { value: "24/7", label: "Support" },
] as const;

const features = [
  { icon: "📝", title: "Realistic Exams", desc: "Practice with questions that mirror the actual certification exams." },
  { icon: "📊", title: "Smart Analytics", desc: "Track your progress and identify weak areas instantly." },
  { icon: "⏰", title: "Timed Practice", desc: "Build exam confidence with realistic time constraints." },
  { icon: "✓", title: "Expert Explanations", desc: "Deep-dive into every answer with detailed walkthroughs." },
  { icon: "📅", title: "Daily Updates", desc: "Fresh questions added regularly to keep you prepared." },
  { icon: "👥", title: "Community", desc: "Join thousands of learners and share knowledge." },
] as const;

const certifications = [
  { provider: "AWS", certs: ["Solutions Architect", "Developer Associate", "SysOps Admin"], badge: "🔶" },
  { provider: "Azure", certs: ["AZ-900 Fundamentals", "AZ-104 Administrator", "AZ-204 Developer"], badge: "🔷" },
  { provider: "Google Cloud", certs: ["Associate Cloud Engineer", "Professional Architect", "Data Engineer"], badge: "🔴" },
] as const;

const testimonials = [
  { name: "Minh Nguyen", role: "Cloud Engineer @ FPT", avatar: "M", content: "Passed AWS SAA on my first attempt! The practice exams were incredibly accurate.", rating: 5 },
  { name: "Linh Tran", role: "DevOps Lead @ Viettel", avatar: "L", content: "The detailed explanations helped me understand concepts I struggled with for months.", rating: 5 },
  { name: "Duc Pham", role: "Junior Developer", avatar: "D", content: "Best investment for my career. Got certified in just 3 weeks of practice!", rating: 5 },
] as const;

const LandingPage = () => {
  const router = useRouter();

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 overflow-y-auto">
        <section className="section-muted border-b" style={{ borderColor: "var(--border-clr)" }}>
          <div className="mx-auto max-w-4xl px-6 py-16 text-center md:py-24">
            <p className="app-eyebrow mb-3 text-sm font-semibold uppercase tracking-wider">Cloud certification practice</p>
            <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight md:text-5xl" style={{ color: "var(--text-primary)" }}>
              Master Cloud <br />
              <span className="wordmark-accent">Certifications</span>
            </h1>
            <p className="mx-auto mb-8 max-w-xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Join 50,000+ professionals who passed their AWS, Azure & GCP exams using our AI-powered practice platform.
            </p>
            <div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
              <button className="primary-action flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-base font-semibold" onClick={() => router.push('/register')}>
                <span>▶</span>
                Start Free Trial
              </button>
              <button className="secondary-action flex-1 rounded-lg py-3 text-base font-semibold" onClick={() => router.push('/login')}>
                Explore Exams
              </button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-8">
          <div className="surface-card grid grid-cols-2 overflow-hidden rounded-xl sm:grid-cols-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="p-4 text-center sm:border-r last:border-r-0" style={{ borderColor: "var(--border-clr)" }}>
                <span className="wordmark-accent block text-lg font-bold">{stat.value}</span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-8">
          <div className="mb-6 text-center">
            <span className="app-eyebrow mb-2 block text-sm font-semibold uppercase tracking-wider">Features</span>
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Everything you need to pass</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {features.map((feature, idx) => (
              <div key={idx} className="surface-card rounded-xl p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "var(--primary-soft)", color: "var(--primary)" }}>{feature.icon}</div>
                <h3 className="mb-1 text-sm font-bold" style={{ color: "var(--text-primary)" }}>{feature.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-8">
          <div className="mb-6 text-center">
            <span className="app-eyebrow mb-2 block text-sm font-semibold uppercase tracking-wider">Certifications</span>
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>All major cloud platforms</h2>
          </div>
          <div className="space-y-4">
            {certifications.map((cert, idx) => (
              <div key={idx} className="surface-card overflow-hidden rounded-xl">
                <div className="flex items-center gap-3 border-b px-5 py-4" style={{ borderColor: "var(--border-clr)" }}>
                  <span className="text-2xl">{cert.badge}</span>
                  <div>
                    <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>{cert.provider}</h3>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{cert.certs.length} certifications available</p>
                  </div>
                </div>
                <div className="p-3">
                  {cert.certs.map((c, i) => (
                    <div
                      key={i}
                      className="surface-subtle mb-2 flex items-center justify-between rounded-lg px-4 py-3 last:mb-0"
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-emerald-600">✓</span>
                        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{c}</span>
                      </div>
                      <span style={{ color: "var(--text-muted)" }}>›</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-8">
          <div className="mb-6 text-center">
            <span className="app-eyebrow mb-2 block text-sm font-semibold uppercase tracking-wider">Testimonials</span>
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Loved by professionals</h2>
          </div>
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide">
            {testimonials.map((t, idx) => (
              <div key={idx} className="surface-card flex min-w-[280px] flex-1 snap-center flex-col rounded-xl p-5">
                <div className="mb-3 flex gap-1 text-sm text-amber-500">{[...Array(t.rating)].map((_, i) => <span key={i}>★</span>)}</div>
                <p className="mb-4 flex-1 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>&quot;{t.content}&quot;</p>
                <div className="flex items-center gap-3 border-t pt-4" style={{ borderColor: "var(--border-clr)" }}>
                  <div className="brand-mark flex h-10 w-10 items-center justify-center rounded-full font-bold">{t.avatar}</div>
                  <div><h4 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.name}</h4><p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.role}</p></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section-muted mx-auto max-w-4xl border-t px-4 py-12" style={{ borderColor: "var(--border-clr)" }}>
          <div className="rounded-xl border p-8 text-center" style={{ background: "var(--primary-soft)", borderColor: "var(--primary-soft-border)" }}>
            <h2 className="mb-2 text-xl font-bold" style={{ color: "var(--text-primary)" }}>Start your journey today</h2>
            <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>Get access to 10,000+ questions across AWS, Azure & GCP.</p>
            <button className="primary-action rounded-lg px-6 py-3 text-base font-semibold" onClick={() => router.push('/register')}>Get Started — It&apos;s Free</button>
          </div>
        </section>
      </main>

      <footer className="border-t px-6 py-6" style={{ borderColor: "var(--border-clr)" }}>
        <div className="mb-3 flex items-center justify-center gap-2"><span className="brand-mark flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold">C</span><span className="wordmark text-sm font-semibold">Cloud<span className="wordmark-accent">Exam</span></span></div>
        <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>© 2024 CloudExam. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
