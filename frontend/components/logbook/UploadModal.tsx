"use client";

import { X } from "lucide-react";
import { useLogbookUploader } from "@/hooks/useLogbookUploader";
import { FileUploadDropzone, ExtractedDataTable } from "./UploaderUI";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const {
    file,
    extractedData,
    isSaving,
    handleFileUpload,
    handleFieldChange,
    handleSaveToDatabase,
  } = useLogbookUploader();

  if (!isOpen) return null;

  return (
    // Backdrop overlay ng modal (nagpapadilim sa background ng dashboard)
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      {/* Container ng Floating Box - Dynamic ang lapad depende kung may table data na */}
      <div
        className={`bg-white rounded-2xl shadow-xl border w-full transition-all duration-300 flex flex-col max-h-[90vh] ${
          extractedData.length > 0 ? "max-w-4xl" : "max-w-xl"
        }`}
      >
        {/* MODAL HEADER */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <div>
            <h2 className="text-base font-bold text-[#0A4C5A]">
              CSV Bulk Uploader
            </h2>
            <p className="text-xs text-gray-500">
              I-drop ang transaksyon logs para i-sync sa Supabase.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY (Scrollable area) */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {extractedData.length === 0 && (
            <FileUploadDropzone file={file} onUpload={handleFileUpload} />
          )}

          <ExtractedDataTable
            data={extractedData}
            onFieldChange={handleFieldChange}
            onSave={async () => {
              await handleSaveToDatabase();
              onClose(); // Kusang magsasara ang floating window kapag success ang upload!
            }}
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  );
}
