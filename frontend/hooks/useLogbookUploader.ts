// hooks/useLogbookUploader.ts
import { useState } from "react";
import { ExtractedLog } from "@/types/logbook";
import { supabase } from "@/lib/supabase";

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

        const date = rawDate?.trim() || "";
        const name = rawName?.trim().toUpperCase();
        if (!name) continue;

        const newGallon = parseInt(newGallonStr) || 0;
        const oldGallon = parseInt(oldGallonStr) || 0;
        const type = typeStr?.trim() || "Standard";
        const address = addressStr?.trim() || "";

        // PINAKAMAHALAGANG UPDATE
        // Kasama na ang DATE sa unique identifier string natin!
        // Format: "2025-12-02_ELVIE_SLIM"
        const uniqueKey = `${date}_${name}_${type.toUpperCase()}`;

        if (mergedDataMap.has(uniqueKey)) {
          // KUNG SAKTONG SAME ANG PETSA, PANGALAN, AT TYPE: Dito lang mag-o-auto-plus/merge!
          const existingRecord = mergedDataMap.get(uniqueKey)!;

          existingRecord.newGallon += newGallon;
          existingRecord.oldGallon += oldGallon;

          if (address && !existingRecord.address.includes(address)) {
            existingRecord.address = existingRecord.address
              ? `${existingRecord.address}, ${address}`
              : address;
          }
        } else {
          // KUNG MAGKAIBA ANG DATE (kahit parehong Elvie at Slim): Lalabas ito bilang bagong hiwalay na row!
          mergedDataMap.set(uniqueKey, {
            id: currentId++,
            date: date,
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

  // 1. Magdagdag ng maliit na helper function sa itaas o sa loob ng hook file:
  const formatToPostgresDate = (dateStr: string): string => {
    if (!dateStr) return new Date().toISOString().split("T")[0]; // fallback kung walang date

    // Palitan ang slashes (/) ng dashes (-) kung meron man
    const cleanDate = dateStr.replace(/\//g, "-").trim();
    const parts = cleanDate.split("-");

    // Kung ang format ay DD-MM-YYYY (e.g., 15-12-2025)
    if (parts.length === 3 && parts[0].length <= 2 && parts[2].length === 4) {
      const day = parts[0].padStart(2, "0");
      const month = parts[1].padStart(2, "0");
      const year = parts[2];
      return `${year}-${month}-${day}`; // Magiging 2025-12-15
    }

    // Kung naka YYYY-MM-DD na, ibalik lang ang orihinal
    return cleanDate;
  };

  // 2. I-update ang handleSaveToDatabase map logic mo:
  const handleSaveToDatabase = async () => {
    if (extractedData.length === 0) return;
    setIsSaving(true);

    try {
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
