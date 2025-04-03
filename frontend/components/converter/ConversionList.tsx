import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Conversion {
  id: string;
  originalFileName: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
}

const FRONTEND_URI = process.env.NEXT_PUBLIC_FRONTEND_URI;

export function ConversionList() {
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchConversions = async () => {
      const token = localStorage.getItem("token"); // Get token from localStorage
      if (!token) {
        console.error("No token found, user not authenticated.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${FRONTEND_URI}/conversions`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Attach token in Authorization header
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch conversions");
        }

        const data = await response.json();
        setConversions(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversions();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading conversions...</p>
      </div>
    );
  }

  if (conversions.length === 0) {
    return (
      <div className="text-center p-12">
        <p className="text-muted-foreground">
          You haven't converted any PDFs yet.
        </p>
        <Link href="/dashboard">
          <Button className="mt-4">Convert a PDF</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {conversions.map((conversion) => (
        <Card
          key={conversion.id}
          className="cursor-pointer hover:shadow-lg transition-shadow duration-300"
          onClick={() => router.push(`/dashboard/conversions/results/${conversion.id}`)}
        >
          <CardHeader>
            <CardTitle>{conversion.originalFileName}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Status:{" "}
              <span className="font-medium">
                {conversion.status === "completed" ? (
                  <span className="text-green-500">Completed</span>
                ) : conversion.status === "pending" ? (
                  <span className="text-yellow-500">Pending</span>
                ) : conversion.status === "processing" ? (
                  <span className="text-blue-500">Processing</span>
                ) : (
                  <span className="text-red-500">Failed</span>
                )}
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              Created:{" "}
              <span className="font-medium">
                {new Date(conversion.createdAt).toLocaleString()}
              </span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
