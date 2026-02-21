import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SnackbarProvider } from "@/components/Snackbar";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
