import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "PolicyLens | Public Consultation Intelligence & Sentiment Analysis",
  description:
    "AI-Based Sentiment Analysis and Evidence-Linked Policy Insights for E-Consultation Feedback",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex text-slate-900 antialiased font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-8 max-w-7xl w-full mx-auto overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
