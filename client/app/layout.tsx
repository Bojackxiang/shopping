import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/provider/auth-provider";
import { ConfirmDialogProvider } from "@/provider/confirm-dialog-provider";
import { Toaster } from "sonner";
import PageViewTracker from "@/components/page-view-tracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_CLIENT_TITLE || "App",
  description: process.env.NEXT_PUBLIC_CLIENT_TITLE || "App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
          <Suspense fallback={null}>
            <PageViewTracker />
          </Suspense>
        </AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "var(--card)",
              color: "var(--card-foreground)",
              border: "1px solid var(--border)",
            },
            className: "sonner-toast",
          }}
        />
      </body>
    </html>
  );
}
