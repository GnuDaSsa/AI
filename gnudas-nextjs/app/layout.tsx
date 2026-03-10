import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "AI Club · Deep Learning Crew",
  description: "성남시청 AI 활용 동아리 · GPT·Gemini 기반 9가지 AI 도구 허브",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 pt-16 md:p-6 md:pt-6">
          {children}
        </main>
      </body>
    </html>
  );
}
