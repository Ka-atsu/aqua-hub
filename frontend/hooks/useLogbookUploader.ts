// hooks/useLogbookUploader.ts
import { useState } from "react";
import { ExtractedLog } from "@/types/logbook";
import { supabase } from "@/lib/supabase";

export function useLogbookUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedLog[]>([]);
  const [isSaving, setIsSaving] = useState(false); // Dagdag loading state para sa UI

  const handleFileUpload = (uploadedFile: File) => {
    // ... (Same logic as before para sa CSV parsing)
    setFile(uploadedFile);
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target?.result as string;
      if (!csvText) return;
      const lines = csvText.split("\n");
      const parsedData: ExtractedLog[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
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

  // BAGONG LOGIC PARA SA SUPABASE
  const handleSaveToDatabase = async () => {
    if (extractedData.length === 0) return;
    setIsSaving(true);

    try {
      // I-format ang data para sumakto sa Supabase table columns
      const recordsToInsert = extractedData.map((row) => ({
        name: row.name,
        new_gallon: row.newGallon,
        old_gallon: row.oldGallon,
        type: row.type,
        notes: row.address,
      }));

      // Mag-insert sa 'transactions' table
      const { error } = await supabase
        .from("transactions")
        .insert(recordsToInsert);

      if (error) throw error;

      alert(
        `Success! ${extractedData.length} records mula sa CSV ay naka-save na sa Supabase!`,
      );

      // I-reset ang form kapag successful
      setExtractedData([]);
      setFile(null);
    } catch (error: any) {
      console.error("Error saving to database:", error);
      alert(`May error sa pag-save: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    file,
    extractedData,
    isSaving, // I-return ito para ma-disable ang button sa UI habang nagse-save
    handleFileUpload,
    handleFieldChange,
    handleSaveToDatabase,
  };
}
