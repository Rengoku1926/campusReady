// File: /app/dashboard/conversions/page.tsx
"use client"
import { ConversionList } from "@/components/converter/ConversionList";
import { ConversionResult } from "@/components/converter/ConversionResult";
import { FileUpload } from "@/components/converter/FileUpload";



export default function ConversionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Your Conversions</h2>
        <p className="text-muted-foreground">
          View and manage all your PDF to XML conversions.
        </p>
       
      </div>

      
    </div>
  );
}