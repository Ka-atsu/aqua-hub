// hooks/useLogbookUploader.ts
import { useState } from "react";
import { ExtractedLog } from "@/types/logbook";

export function useLogbookUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedLog[]>([]);

  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);

    const reader = new FileReader();

    reader.onload = (event) => {
      const csvText = event.target?.result as string;
      if (!csvText) return;

      const lines = csvText.split("\n");
      const parsedData: ExtractedLog[] = [];

      // Index 1 para i-skip ang header row (Name, New_Gallon, Old_Gallon, Type, Notes)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Hahatiin by comma batay sa format ng Excel mo
        const [name, newGallon, oldGallon, type, notes] = line.split(",");

        parsedData.push({
          id: i,
          name: name?.trim() || "",
          newGallon: parseInt(newGallon) || 0,
          oldGallon: parseInt(oldGallon) || 0,
          type: type?.trim() || "",
          address: notes?.trim() || "",
        });
      }

      setExtractedData(parsedData);
    };

    reader.readAsText(uploadedFile);
  };

  const handleFieldChange = (
    id: number,
    field: keyof ExtractedLog,
    value: string | number,
  ) => {
    setExtractedData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const handleSaveToDatabase = () => {
    console.log("Ipinapasok na sa Database...", extractedData);
    alert(
      `Success! ${extractedData.length} records mula sa CSV ay naka-save na!`,
    );

    setExtractedData([]);
    setFile(null);
  };

  return {
    file,
    extractedData,
    handleFileUpload,
    handleFieldChange,
    handleSaveToDatabase,
  };
}
