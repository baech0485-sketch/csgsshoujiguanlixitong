import type { Metadata } from "next";
import { AR_One_Sans, Noto_Sans_SC } from "next/font/google";
import { FrontendAuthGate } from "@/components/frontend-auth-gate";
import "./globals.css";
import "./desktop.css";
import "./mobile.css";

const notoSansSc = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto",
  display: "swap",
});

const arOneSans = AR_One_Sans({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-ar-one",
  display: "swap",
});

export const metadata: Metadata = {
  title: "呈尚策划公司手机管理系统",
  description: "根据 Figma 设计落地的手机资产管理系统前端",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className={`${notoSansSc.variable} ${arOneSans.variable}`}>
        <FrontendAuthGate>{children}</FrontendAuthGate>
      </body>
    </html>
  );
}
