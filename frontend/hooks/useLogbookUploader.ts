import { useState } from "react";
import { supabase } from "@/lib/supabase";

// Updated Interface based on the new 4-column CSV format
export interface ExtractedLog {
  id: number;
  date: string;
  name: string;
  quantity: number;
  type: string;
}

// BULLETPROOF HELPER FUNCTION
const formatToPostgresDate = (dateStr: string): string => {
  if (!dateStr) return new Date().toISOString().split("T")[0]; // Fallback sa araw na ito

  // Remove the invisible characters (\r) and change the / with -
  const cleanDate = dateStr.replace(/\//g, "-").replace(/\r/g, "").trim();
  const parts = cleanDate.split("-");

  if (parts.length === 3) {
    // FORMAT: DD-MM-YYYY (Hal. 15-12-2025)
    if (parts[2].length === 4) {
      const day = parts[0].padStart(2, "0");
      const month = parts[1].padStart(2, "0");
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    // FORMAT: YYYY-MM-DD
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

      // Start at 1 to skip CSV header
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Read the 4 columns from the new CSV format: Date, Name, Quantity, Type
        const [rawDate, rawName, rawQtyStr, rawTypeStr] = line.split(",");

        const date = rawDate?.replace(/\r/g, "").trim() || "";
        const name = rawName?.replace(/\r/g, "").trim().toUpperCase();
        if (!name) continue;

        const quantity = parseInt(rawQtyStr) || 0;
        const type =
          rawTypeStr?.replace(/\r/g, "").trim().toUpperCase() || "SLIM";

        // Merge duplicates using Date + Name + Type
        const uniqueKey = `${date}_${name}_${type}`;

        if (mergedDataMap.has(uniqueKey)) {
          const existingRecord = mergedDataMap.get(uniqueKey)!;
          existingRecord.quantity += quantity;
        } else {
          mergedDataMap.set(uniqueKey, {
            id: currentId++,
            date,
            name,
            quantity,
            type,
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
      // ==========================================
      // STEP 1: Load Container Types Once
      // ==========================================
      const { data: typesData, error: typesError } = await supabase
        .from("container_types")
        .select("container_type_id, type_name");

      if (typesError) throw typesError;

      const typeMap = new Map<string, number>();
      typesData.forEach((t) =>
        typeMap.set(t.type_name.toUpperCase(), t.container_type_id),
      );

      // ==========================================
      // STEP 2: Load Customers Once
      // ==========================================
      const { data: custData, error: custError } = await supabase
        .from("customers")
        .select("customer_id, first_name");

      if (custError) throw custError;

      const customerMap = new Map<string, string>(); // first_name -> customer_id
      custData.forEach((c) =>
        customerMap.set(c.first_name.toUpperCase(), c.customer_id),
      );

      // ==========================================
      // STEP 3: Insert Missing Customers
      // ==========================================
      const uniqueNamesInCSV = Array.from(
        new Set(extractedData.map((d) => d.name)),
      );
      const missingNames = uniqueNamesInCSV.filter(
        (name) => !customerMap.has(name),
      );

      if (missingNames.length > 0) {
        const newCustomers = missingNames.map((name) => ({
          first_name: name,
          last_name: null,
        }));

        const { data: newCustData, error: newCustError } = await supabase
          .from("customers")
          .insert(newCustomers)
          .select("customer_id, first_name");

        if (newCustError) throw newCustError;

        // Update the customer map with the newly generated UUIDs
        newCustData.forEach((c) =>
          customerMap.set(c.first_name.toUpperCase(), c.customer_id),
        );
      }

      // ==========================================
      // STEP 4: Group Records by Customer + Date
      // ==========================================
      // A single transaction header is created per customer per day.
      const transactionGroups = new Map<string, ExtractedLog[]>();

      extractedData.forEach((row) => {
        const custId = customerMap.get(row.name);
        const formattedDate = formatToPostgresDate(row.date);
        const groupKey = `${custId}_${formattedDate}`;

        if (!transactionGroups.has(groupKey)) {
          transactionGroups.set(groupKey, []);
        }
        transactionGroups.get(groupKey)!.push(row);
      });

      // ==========================================
      // STEP 5: Insert Transaction Headers
      // ==========================================
      const transactionsToInsert = Array.from(transactionGroups.keys()).map(
        (key) => {
          const [customer_id, transaction_date] = key.split("_");
          return { customer_id, transaction_date };
        },
      );

      const { data: insertedTxData, error: txError } = await supabase
        .from("container_transactions")
        .insert(transactionsToInsert)
        .select("transaction_id, customer_id, transaction_date");

      if (txError) throw txError;

      // Map back the generated transaction_ids
      const txIdMap = new Map<string, string>();
      insertedTxData.forEach((tx) => {
        txIdMap.set(
          `${tx.customer_id}_${tx.transaction_date}`,
          tx.transaction_id,
        );
      });

      // ==========================================
      // STEP 6: Insert Transaction Items
      // ==========================================
      const itemsToInsert: any[] = [];

      for (const row of extractedData) {
        const custId = customerMap.get(row.name);
        const formattedDate = formatToPostgresDate(row.date);
        const groupKey = `${custId}_${formattedDate}`;
        const transaction_id = txIdMap.get(groupKey);

        const container_type_id = typeMap.get(row.type);
        if (!container_type_id) {
          throw new Error(`Unrecognized container type in CSV: ${row.type}`);
        }

        itemsToInsert.push({
          transaction_id,
          container_type_id,
          quantity: row.quantity,
        });
      }

      const { error: itemsError } = await supabase
        .from("container_transaction_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      alert(
        `Success! Saved ${itemsToInsert.length} items across ${transactionsToInsert.length} transactions.`,
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
