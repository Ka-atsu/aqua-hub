// app/layout.tsx
"use client"; // Gawin nating client entry frame ang global container frame

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import UploadModal from "@/components/logbook/UploadModal";
import "./globals.css"; // Panatilihin ang default dashboard styles mo dito

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <html lang="en">
      <body>
        <div className="flex bg-gray-50 min-h-screen">
          {/* Ipinapasa ang state controller dito sa Sidebar prop natin */}
          <Sidebar onOpenUpload={() => setIsUploadOpen(true)} />

          {/* Dito sa kanang bahagi lalabas ang mga graphs/tables mo */}
          <main className="flex-1 overflow-x-hidden">{children}</main>

          {/* FLOATING BOX: Nakaabang sa back-end thread, ready lumitaw kahit saang link mapindot! */}
          <UploadModal
            isOpen={isUploadOpen}
            onClose={() => setIsUploadOpen(false)}
          />
        </div>
      </body>
    </html>
  );
}
