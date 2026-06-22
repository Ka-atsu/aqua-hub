// app/logbook-uploader/page.tsx
"use client";

import { useLogbookUploader } from "@/hooks/useLogbookUploader";
import {
  FileUploadDropzone,
  ExtractedDataTable,
} from "@/components/logbook/UploaderUI";

export default function LogbookUploaderPage() {
  const {
    file,
    extractedData,
    isSaving, // <-- Kunin ang loading state mula sa useLogbookUploader hook
    handleFileUpload,
    handleFieldChange,
    handleSaveToDatabase,
  } = useLogbookUploader();

  return (
    // Isinakop ang max-w-full para magamit ang buong lapad ng monitor nang walang waste of space
    <div className="p-4 max-w-full mx-auto space-y-4 text-gray-800">
      {/* HEADER SECTION */}
      <div className="border-b pb-2 flex justify-between items-end">
        <div>
          <h1 className="text-xl font-bold text-[#0A4C5A]">
            CSV Bulk Uploader
          </h1>
          <p className="text-xs text-gray-500">
            Mag-upload ng .csv file para sa mga transaksyon (December hanggang
            January).
          </p>
        </div>
      </div>

      {/* DROPZONE - Awtomatikong magtatago kapag may records na para iwas kalat sa desktop screen */}
      {extractedData.length === 0 && (
        <FileUploadDropzone file={file} onUpload={handleFileUpload} />
      )}

      {/* EDITABLE TABLE COMPONENT - Ipinasa ang pinakabagong parameter data at isSaving variable */}
      <ExtractedDataTable
        data={extractedData}
        onFieldChange={handleFieldChange}
        onSave={handleSaveToDatabase}
        isSaving={isSaving} // <-- I-bind dito para gumana ang disabled save button kapag naglo-load
      />
    </div>
  );
}
