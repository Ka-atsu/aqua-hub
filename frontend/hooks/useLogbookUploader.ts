// hooks/useLogbookUploader.ts
import { useState } from "react";
import { ExtractedLog } from "@/types/logbook";
import { supabase } from "@/lib/supabase";

// BULLETPROOF HELPER FUNCTION (Nasa labas ng hook para hindi mag-recreate kada render)
const formatToPostgresDate = (dateStr: string): string => {
  if (!dateStr) return new Date().toISOString().split("T")[0]; // Fallback sa araw na ito

  // Tanggalin ang invisible characters (\r) at palitan ang / ng -
  const cleanDate = dateStr.replace(/\//g, "-").replace(/\r/g, "").trim();
  const parts = cleanDate.split("-");

  if (parts.length === 3) {
    // FORMAT: DD-MM-YYYY (Hal. 15-12-2025)
    if (parts[2].length === 4) {
      const day = parts[0].padStart(2, "0");
      const month = parts[1].padStart(2, "0");
      const year = parts[2];
      return `${year}-${month}-${day}`; // Nagiging 2025-12-15
    }
    // FORMAT: YYYY-MM-DD (Kung sakaling tama na ang format galing CSV)
    else if (parts[0].length === 4) {
      const year = parts[0];
      const month = parts[1].padStart(2, "0");
      const day = parts[2].padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  }

  return cleanDate;
};

export function useLogbookUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedLog[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    const reader = new FileReader();

    reader.onload = (event) => {
      const csvText = event.target?.result as string;
      if (!csvText) return;

      const lines = csvText.split("\n");
      const mergedDataMap = new Map<string, ExtractedLog>();
      let currentId = 1;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Basahin ang 6 columns galing sa CSV
        const [
          rawDate,
          rawName,
          newGallonStr,
          oldGallonStr,
          typeStr,
          addressStr,
        ] = line.split(",");

        // SIGURADUHING WALANG \r SA MGA STRINGS
        const date = rawDate?.replace(/\r/g, "").trim() || "";
        const name = rawName?.replace(/\r/g, "").trim().toUpperCase();
        if (!name) continue;

        const newGallon = parseInt(newGallonStr) || 0;
        const oldGallon = parseInt(oldGallonStr) || 0;
        const type = typeStr?.replace(/\r/g, "").trim() || "Standard";
        const address = addressStr?.replace(/\r/g, "").trim() || "";

        const uniqueKey = `${date}_${name}_${type.toUpperCase()}`;

        if (mergedDataMap.has(uniqueKey)) {
          const existingRecord = mergedDataMap.get(uniqueKey)!;
          existingRecord.newGallon += newGallon;
          existingRecord.oldGallon += oldGallon;

          if (address && !existingRecord.address.includes(address)) {
            existingRecord.address = existingRecord.address
              ? `${existingRecord.address}, ${address}`
              : address;
          }
        } else {
          mergedDataMap.set(uniqueKey, {
            id: currentId++,
            date: date, // Mananatili munang display format dito
            name: name,
            newGallon: newGallon,
            oldGallon: oldGallon,
            type: type,
            address: address,
          });
        }
      }

      setExtractedData(Array.from(mergedDataMap.values()));
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

  const handleSaveToDatabase = async () => {
    if (extractedData.length === 0) return;
    setIsSaving(true);

    try {
      // DITO NATIN I-FOFORMAT ANG PETSA BAGO IPASA KAY SUPABASE
      const recordsToInsert = extractedData.map((row) => ({
        transaction_date: formatToPostgresDate(row.date),
        name: row.name,
        new_gallon: row.newGallon,
        old_gallon: row.oldGallon,
        type: row.type,
        address: row.address,
      }));

      const { error } = await supabase
        .from("transactions")
        .insert(recordsToInsert);

      if (error) throw error;

      alert(
        `Success! ${extractedData.length} clean transactions saved to Supabase!`,
      );
      setExtractedData([]);
      setFile(null);
    } catch (error: any) {
      console.error("Error saving to database:", error);
      alert(`Error saving to database: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    file,
    extractedData,
    isSaving,
    handleFileUpload,
    handleFieldChange,
    handleSaveToDatabase,
  };
}
