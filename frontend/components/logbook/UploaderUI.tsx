// components/logbook/UploaderUI.tsx
import {
  Upload,
  FileSpreadsheet,
  Check,
  AlertCircle,
  Save,
} from "lucide-react";
import {
  FileUploadDropzoneProps,
  ExtractedDataTableProps,
} from "../../types/logbook";

export function FileUploadDropzone({
  file,
  onUpload,
}: FileUploadDropzoneProps) {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50 hover:bg-gray-100 transition relative flex items-center justify-center gap-4">
      <input
        type="file"
        accept=".csv"
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={(e) => {
          const selectedFile = e.target.files?.[0];
          if (selectedFile) onUpload(selectedFile);
        }}
      />
      {file ? (
        <>
          <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
          <p className="text-sm font-semibold text-emerald-600">
            Naka-load na: {file.name}
          </p>
        </>
      ) : (
        <>
          <Upload className="w-6 h-6 text-gray-400" />
          <p className="text-sm text-gray-600 font-medium">
            I-drag o i-click dito para i-upload ang CSV file
          </p>
        </>
      )}
    </div>
  );
}

export function ExtractedDataTable({
  data,
  onFieldChange,
  onSave,
  isSaving,
}: ExtractedDataTableProps) {
  if (data.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow border p-4 space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold flex items-center gap-2 text-[#0A4C5A]">
          <Check className="text-emerald-500 w-4 h-4" /> Handa na i-save sa
          AQUA-HUB Database
        </h2>
        <div className="flex gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md items-center">
          <AlertCircle className="w-3 h-3" /> May {data.length} unique items
          pagkatapos i-merge ang duplicates
        </div>
      </div>

      <div className="overflow-x-auto max-h-125">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 text-xs font-semibold uppercase text-gray-600 border-b sticky top-0">
              <th className="py-2 px-2">Date</th>
              <th className="py-2 px-2">Name</th>
              <th className="py-2 px-2 text-center">New Gal</th>
              <th className="py-2 px-2 text-center">Old Gal</th>
              <th className="py-2 px-2">Type</th>
              <th className="py-2 px-2">Address</th>
            </tr>
          </thead>
          <tbody className="divide-y text-xs">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="p-1 w-28">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-[#0A4C5A] rounded bg-transparent font-mono"
                    value={row.date}
                    onChange={(e) =>
                      onFieldChange(row.id, "date", e.target.value)
                    }
                  />
                </td>
                <td className="p-1">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-[#0A4C5A] rounded bg-transparent font-semibold"
                    value={row.name}
                    onChange={(e) =>
                      onFieldChange(row.id, "name", e.target.value)
                    }
                  />
                </td>
                <td className="p-1 text-center">
                  <input
                    type="number"
                    min="0"
                    className="w-14 px-1 py-1 text-center mx-auto border border-transparent hover:border-gray-300 focus:border-[#0A4C5A] rounded bg-transparent"
                    value={row.newGallon}
                    onChange={(e) =>
                      onFieldChange(
                        row.id,
                        "newGallon",
                        parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </td>
                <td className="p-1 text-center">
                  <input
                    type="number"
                    min="0"
                    className="w-14 px-1 py-1 text-center mx-auto border border-transparent hover:border-gray-300 focus:border-[#0A4C5A] rounded bg-transparent"
                    value={row.oldGallon}
                    onChange={(e) =>
                      onFieldChange(
                        row.id,
                        "oldGallon",
                        parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </td>
                <td className="p-1 w-24">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-[#0A4C5A] rounded bg-transparent"
                    value={row.type}
                    onChange={(e) =>
                      onFieldChange(row.id, "type", e.target.value)
                    }
                  />
                </td>
                <td className="p-1">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-[#0A4C5A] rounded bg-transparent"
                    value={row.address}
                    onChange={(e) =>
                      onFieldChange(row.id, "address", e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pt-3 border-t flex justify-end">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="bg-emerald-600 disabled:bg-gray-400 text-white px-4 py-2 text-sm rounded-md font-semibold hover:bg-emerald-700 flex items-center gap-2 transition"
        >
          <Save className="w-4 h-4" />{" "}
          {isSaving ? "Inirirecord pa..." : "I-save Lahat sa Supabase"}
        </button>
      </div>
    </div>
  );
}
