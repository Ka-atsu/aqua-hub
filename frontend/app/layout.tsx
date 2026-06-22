import React from "react";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8FAFC] text-[#0A4C5A] font-sans flex m-0">
        {/* 1. Render the Sidebar */}
        <Sidebar />

        {/* 2. Main Content Area takes the rest of the screen */}
        <main className="flex-1 p-6 h-screen overflow-y-auto">{children}</main>
      </body>
    </html>
  );
}
