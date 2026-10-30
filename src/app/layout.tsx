import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillMatch — Nền tảng kết nối việc làm thông minh bằng AI",
  description: "Kết nối kỹ năng và cơ hội việc làm mơ ước với công nghệ AI Matching tiên tiến.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#f8f9fc] text-[#17152d] font-sans antialiased selection:bg-violet-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
