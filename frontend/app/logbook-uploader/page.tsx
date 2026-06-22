// app/logbook-uploader/page.tsx
"use client";

import {
  Upload,
  Check,
  AlertCircle,
  Save,
  FileSpreadsheet,
} from "lucide-react";
import { useLogbookUploader } from "@/hooks/useLogbookUploader";

export default function LogbookUploaderPage() {
  const {
    file,
    extractedData,
    handleFileUpload,
    handleFieldChange,
    handleSaveToDatabase,
  } = useLogbookUploader();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 text-gray-800">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-[#0A4C5A]">CSV Bulk Uploader</h1>
        <p className="text-sm text-gray-500">
          Mag-upload ng .csv file para madaliang ipasok ang mga transaksyon.
        </p>
      </div>

      {/* 1. FILE UPLOAD DROPZONE */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition relative">
        <input
          type="file"
          accept=".csv"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0];
            if (selectedFile) handleFileUpload(selectedFile);
          }}
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          {file ? (
            <>
              <FileSpreadsheet className="w-10 h-10 text-emerald-500" />
              <p className="text-sm font-semibold text-emerald-600">
                Naka-load na: {file.name}
              </p>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 text-gray-400" />
              <p className="text-sm text-gray-600">
                I-drag o i-click dito para i-upload ang iyong CSV file
              </p>
            </>
          )}
        </div>
      </div>

      {/* 2. AUTO-POPULATED FIELDS EDITING REGION */}
      {extractedData.length > 0 && (
        <div className="bg-white rounded-xl shadow border p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-[#0A4C5A]">
              <Check className="text-emerald-500 w-5 h-5" /> Handa na i-save
              mula sa CSV
            </h2>
            <div className="flex gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full items-center">
              <AlertCircle className="w-4 h-4" /> I-double check ang data bago
              i-save
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b">
                  <th className="p-3">Name</th>
                  <th className="p-3 text-center">New_Gallon</th>
                  <th className="p-3 text-center">Old_Gallon</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Address</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {extractedData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {/* Editable Name */}
                    <td className="p-2">
                      <input
                        type="text"
                        className="w-full p-2 border border-transparent hover:border-gray-300 focus:border-[#0A4C5A] rounded bg-transparent"
                        value={row.name}
                        onChange={(e) =>
                          handleFieldChange(row.id, "name", e.target.value)
                        }
                      />
                    </td>
                    {/* Editable New Gallon */}
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        min="0"
                        className="w-20 p-2 text-center mx-auto border border-transparent hover:border-gray-300 focus:border-[#0A4C5A] rounded bg-transparent"
                        value={row.newGallon}
                        onChange={(e) =>
                          handleFieldChange(
                            row.id,
                            "newGallon",
                            parseInt(e.target.value) || 0,
                          )
                        }
                      />
                    </td>
                    {/* Editable Old Gallon */}
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        min="0"
                        className="w-20 p-2 text-center mx-auto border border-transparent hover:border-gray-300 focus:border-[#0A4C5A] rounded bg-transparent"
                        value={row.oldGallon}
                        onChange={(e) =>
                          handleFieldChange(
                            row.id,
                            "oldGallon",
                            parseInt(e.target.value) || 0,
                          )
                        }
                      />
                    </td>
                    {/* Editable Type */}
                    <td className="p-2">
                      <input
                        type="text"
                        className="w-full p-2 border border-transparent hover:border-gray-300 focus:border-[#0A4C5A] rounded bg-transparent"
                        value={row.type}
                        onChange={(e) =>
                          handleFieldChange(row.id, "type", e.target.value)
                        }
                      />
                    </td>
                    {/* Editable Address */}
                    <td className="p-2">
                      <input
                        type="text"
                        className="w-full p-2 border border-transparent hover:border-gray-300 focus:border-[#0A4C5A] rounded bg-transparent"
                        value={row.address}
                        onChange={(e) =>
                          handleFieldChange(row.id, "address", e.target.value)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FINAL SAVE BUTTON */}
          <div className="pt-4 border-t flex justify-end">
            <button
              onClick={handleSaveToDatabase}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 flex items-center gap-2 transition"
            >
              <Save className="w-5 h-5" /> I-save Lahat sa Database
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
