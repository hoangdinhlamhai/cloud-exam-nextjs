import type { Metadata } from "next";
import { Be_Vietnam_Pro, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SnackbarProvider } from "@/components/Snackbar";
import { ThemeProvider } from "@/components/ThemeProvider";

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-main",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CloudExam - Master Cloud Certifications",
  description: "Join 50,000+ professionals who passed their AWS, Azure & GCP exams using our AI-powered practice platform.",
  keywords: ["cloud certification", "AWS", "Azure", "GCP", "practice exam", "cloud engineer"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark" suppressHydrationWarning>
      <body
        className={`${beVietnam.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <SnackbarProvider>
            {children}
          </SnackbarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

