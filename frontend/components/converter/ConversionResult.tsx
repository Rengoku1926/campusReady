"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

interface Conversion {
  id: string;
  originalFileName: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
  xmlContent: string;
}

const FRONTEND_URI = process.env.NEXT_PUBLIC_FRONTEND_URI;

export default function ConversionResultPage() {
  // Since the route is defined as a catch-all ([...id]), useParams returns an array.
  const params = useParams();
  const conversionId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [conversion, setConversion] = useState<Conversion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversionId) return;
    const token = localStorage.getItem("token");

    const fetchConversion = async () => {
      try {
        const response = await axios.get(
          `${FRONTEND_URI}/conversions/${conversionId}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
        setConversion(response.data);
      } catch (error: any) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversion();

    // Poll for status updates if conversion is still pending or processing
    const interval = setInterval(async () => {
      if (
        conversion &&
        (conversion.status === "pending" || conversion.status === "processing")
      ) {
        await fetchConversion();
      } else {
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [conversionId, conversion?.status]);

  const handleDownload = () => {
    if (!conversion) return;
    const element = document.createElement("a");
    const file = new Blob([conversion.xmlContent], { type: "text/xml" });
    element.href = URL.createObjectURL(file);
    element.download = `${conversion.originalFileName.replace(
      ".pdf",
      ""
    )}.xml`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopyToClipboard = () => {
    if (!conversion) return;
    navigator.clipboard.writeText(conversion.xmlContent);
    // Optionally, you can show a success notification here.
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading conversion...</p>
      </div>
    );
  }

  if (!conversion) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Conversion not found
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          Conversion Result: {conversion.originalFileName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Status: <span className="font-medium">{conversion.status}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Created:{" "}
                <span className="font-medium">
                  {new Date(conversion.createdAt).toLocaleString()}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCopyToClipboard}
                disabled={conversion.status !== "completed"}
              >
                Copy XML
              </Button>
              <Button
                onClick={handleDownload}
                disabled={conversion.status !== "completed"}
              >
                Download XML
              </Button>
            </div>
          </div>

          {conversion.status === "pending" ||
          conversion.status === "processing" ? (
            <div className="flex flex-col items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">
                {conversion.status === "pending"
                  ? "Waiting to process..."
                  : "Converting PDF to XML..."}
              </p>
            </div>
          ) : conversion.status === "failed" ? (
            <div className="rounded-lg bg-destructive/10 p-4 text-center text-destructive">
              Conversion failed. Please try again.
            </div>
          ) : (
            <Tabs defaultValue="xml">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="xml">XML Result</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="xml">
                <div className="relative">
                  <pre className="mt-4 rounded-lg bg-muted p-4 overflow-auto max-h-96">
                    <code>{conversion.xmlContent}</code>
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="preview">
                <div className="mt-4 border rounded-lg p-4 max-h-96 overflow-auto">
                  <div
                    dangerouslySetInnerHTML={{ __html: conversion.xmlContent }}
                  />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
