"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Copy, Download, Search, X } from "lucide-react";
import { useParams } from "next/navigation";
import { DOMParser } from "xmldom";
import { Badge } from "@/components/ui/badge";

interface Conversion {
  id: string;
  originalFileName: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
  xmlContent: string;
}

interface Metadata {
  title: string;
  author: string;
  creationDate: string;
  pageCount: number;
}

interface Section {
  type: string;
  content: string;
  level?: number;
  items?: string[];
}

interface Page {
  number: number;
  sections: Section[];
}

const FRONTEND_URI = process.env.NEXT_PUBLIC_FRONTEND_URI;

export default function ConversionResultPage() {
  // Since the route is defined as a catch-all ([...id]), useParams returns an array.
  const params = useParams();
  const conversionId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [conversion, setConversion] = useState<Conversion | null>(null);
  const [loading, setLoading] = useState(true);
  const [parsedXml, setParsedXml] = useState<{
    metadata: Metadata;
    pages: Page[];
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showSearch, setShowSearch] = useState(false);

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

        // Parse XML if conversion is completed
        if (response.data.status === "completed" && response.data.xmlContent) {
          parseXmlContent(response.data.xmlContent);
        }
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

  const parseXmlContent = (xmlContent: string) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

      // Parse metadata
      const metadataElement = xmlDoc.getElementsByTagName("metadata")[0];
      const metadata: Metadata = {
        title: getElementTextContent(metadataElement, "title"),
        author: getElementTextContent(metadataElement, "author"),
        creationDate: getElementTextContent(metadataElement, "creationDate"),
        pageCount: parseInt(
          getElementTextContent(metadataElement, "pageCount"),
          10
        ),
      };

      // Parse pages
      const pageElements = xmlDoc.getElementsByTagName("page");
      const pages: Page[] = [];

      for (let i = 0; i < pageElements.length; i++) {
        const pageElement = pageElements[i];
        const pageNumber = parseInt(
          pageElement.getAttribute("number") || "0",
          10
        );
        const sections: Section[] = [];

        // Parse headers
        const headers = pageElement.getElementsByTagName("header");
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j];
          sections.push({
            type: "header",
            content: header.textContent || "",
            level: parseInt(header.getAttribute("level") || "1", 10),
          });
        }

        // Parse paragraphs
        const paragraphs = pageElement.getElementsByTagName("paragraph");
        for (let j = 0; j < paragraphs.length; j++) {
          sections.push({
            type: "paragraph",
            content: paragraphs[j].textContent || "",
          });
        }

        // Parse lists
        const lists = pageElement.getElementsByTagName("list");
        for (let j = 0; j < lists.length; j++) {
          const list = lists[j];
          const items = list.getElementsByTagName("item");
          const listItems: string[] = [];

          for (let k = 0; k < items.length; k++) {
            listItems.push(items[k].textContent || "");
          }

          sections.push({
            type: "list",
            content: "",
            items: listItems,
          });
        }

        pages.push({ number: pageNumber, sections });
      }

      setParsedXml({ metadata, pages });
    } catch (error) {
      console.error("Error parsing XML content:", error);
    }
  };

  const getElementTextContent = (
    parentElement: Element,
    tagName: string
  ): string => {
    const element = parentElement.getElementsByTagName(tagName)[0];
    return element ? element.textContent || "" : "";
  };

  const handleDownload = () => {
    if (!conversion) return;
    const element = document.createElement("a");
    const file = new Blob([conversion.xmlContent], { type: "text/xml" });
    element.href = URL.createObjectURL(file);
    element.download = `${conversion.originalFileName.replace(".pdf", "")}.xml`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopyToClipboard = () => {
    if (!conversion) return;
    navigator.clipboard.writeText(conversion.xmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Function to colorize XML tags for display
  const colorizeXml = (xml: string) => {
    if (!xml) return "";

    const tagRegex = /(<\/?)([^>\s]+)([^>]*)(\/?>)/g;
    const attrRegex = /(\w+)=["']([^"']*)["']/g;
    const textRegex = />([^<]+)</g;

    let result = xml
      .replace(tagRegex, (match, startTag, tagName, attrs, endTag) => {
        // Colorize tag name
        return `${startTag}<span class="text-blue-500 font-medium">${tagName}</span>${attrs}${endTag}`;
      })
      .replace(attrRegex, (match, name, value) => {
        // Colorize attributes
        return `<span class="text-purple-500">${name}</span>="<span class="text-green-500">${value}</span>"`;
      });

    return result;
  };

  const highlightSearch = (text: string) => {
    if (!searchText || !text) return { __html: text };

    const regex = new RegExp(`(${searchText})`, "gi");
    const highlighted = text.replace(
      regex,
      '<mark class="bg-yellow-200">$1</mark>'
    );

    return { __html: highlighted };
  };

  const renderSection = (section: Section) => {
    switch (section.type) {
      case "header":
        const HeaderTag = `h${Math.min(Math.max(section.level || 1, 1), 6)}` as
          | "h1"
          | "h2"
          | "h3"
          | "h4"
          | "h5"
          | "h6";
        return (
          <HeaderTag className="font-bold mt-4 mb-2">
            <Badge className="mr-2 bg-blue-500 hover:bg-blue-600">
              H{section.level}
            </Badge>
            {section.content}
          </HeaderTag>
        );
      case "paragraph":
        return (
          <div className="mb-3">
            <Badge className="mr-2 mb-1 bg-green-500 hover:bg-green-600">
              P
            </Badge>
            <p>{section.content}</p>
          </div>
        );
      case "list":
        return (
          <div className="mb-3">
            <Badge className="mr-2 mb-1 bg-orange-500 hover:bg-orange-600">
              LIST
            </Badge>
            <ul className="list-disc pl-6">
              {section.items?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">{status}</Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">{status}</Badge>
        );
      case "failed":
        return <Badge className="bg-red-500 hover:bg-red-600">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
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
        <div className="flex justify-between items-center">
          <CardTitle>
            Conversion Result: {conversion.originalFileName}
          </CardTitle>
          {renderStatusBadge(conversion.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
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
                className="flex items-center"
              >
                <Copy className="h-4 w-4 mr-1" />
                {copied ? "Copied!" : "Copy XML"}
              </Button>
              <Button
                onClick={handleDownload}
                disabled={conversion.status !== "completed"}
                className="flex items-center"
              >
                <Download className="h-4 w-4 mr-1" />
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
            <Tabs defaultValue="preview">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="structure">Structure</TabsTrigger>
                <TabsTrigger value="xml">Raw XML</TabsTrigger>
              </TabsList>

              <TabsContent value="preview">
                <div className="mt-4 border rounded-lg p-6 max-h-96 overflow-auto">
                  {parsedXml && (
                    <div>
                      <div className="mb-6 pb-4 border-b">
                        <h1 className="text-2xl font-bold mb-2">
                          {parsedXml.metadata.title}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                          Author: {parsedXml.metadata.author}
                        </p>
                        {parsedXml.metadata.creationDate && (
                          <p className="text-sm text-muted-foreground">
                            Created: {parsedXml.metadata.creationDate}
                          </p>
                        )}
                      </div>
                      {parsedXml.pages.map((page) => (
                        <div key={page.number} className="mb-8">
                          <div className="flex items-center mb-2">
                            <Badge
                              variant="outline"
                              className="text-xs uppercase tracking-wider"
                            >
                              Page {page.number}
                            </Badge>
                          </div>
                          <div className="pl-2 border-l-2 border-muted">
                            {page.sections.map((section, index) => (
                              <div key={index}>{renderSection(section)}</div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="structure">
                <div className="mt-4 border rounded-lg p-4 max-h-96 w-screen overflow-auto">
                  {parsedXml && (
                    <div>
                      <div className="mb-4">
                        <h3 className="font-bold mb-2 flex items-center">
                          <Badge className="mr-2 bg-purple-500 hover:bg-purple-600">
                            Metadata
                          </Badge>
                          Document Information
                        </h3>
                        <div className="bg-muted p-3 rounded">
                          <div>
                            <strong>Title:</strong> {parsedXml.metadata.title}
                          </div>
                          <div>
                            <strong>Author:</strong> {parsedXml.metadata.author}
                          </div>
                          <div>
                            <strong>Creation Date:</strong>{" "}
                            {parsedXml.metadata.creationDate}
                          </div>
                          <div>
                            <strong>Page Count:</strong>{" "}
                            {parsedXml.metadata.pageCount}
                          </div>
                        </div>
                      </div>

                      <h3 className="font-bold mb-2 flex items-center">
                        <Badge className="mr-2 bg-blue-500 hover:bg-blue-600">
                          Content
                        </Badge>
                        Pages
                      </h3>
                      {parsedXml.pages.map((page) => (
                        <div key={page.number} className="mb-4">
                          <h4 className="font-semibold">
                            <Badge variant="outline" className="mr-2">
                              Page {page.number}
                            </Badge>
                          </h4>
                          <div className="pl-4">
                            {page.sections.map((section, index) => (
                              <div
                                key={index}
                                className="mb-2 bg-muted/50 p-2 rounded"
                              >
                                <div className="text-xs font-medium text-muted-foreground">
                                  {section.type === "header" && (
                                    <Badge
                                      
                                      className="mr-1 bg-blue-500 hover:bg-blue-600"
                                    >
                                      H{section.level}
                                    </Badge>
                                  )}
                                  {section.type === "paragraph" && (
                                    <Badge
                                      
                                      className="mr-1 bg-green-500 hover:bg-green-600"
                                    >
                                      P
                                    </Badge>
                                  )}
                                  {section.type === "list" && (
                                    <Badge
                                      
                                      className="mr-1 bg-orange-500 hover:bg-orange-600"
                                    >
                                      LIST
                                    </Badge>
                                  )}
                                </div>
                                {section.type === "list" ? (
                                  <div>
                                    <div className="font-medium">
                                      Items: {section.items?.length}
                                    </div>
                                    <div className="pl-4">
                                      {section.items
                                        ?.slice(0, 3)
                                        .map((item, i) => (
                                          <div
                                            key={i}
                                            className="text-sm truncate"
                                          >
                                            {item}
                                          </div>
                                        ))}
                                      {(section.items?.length || 0) > 3 && (
                                        <div className="text-sm text-muted-foreground">
                                          ...and{" "}
                                          {(section.items?.length || 0) - 3}{" "}
                                          more
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-sm truncate">
                                    {section.content}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="xml">
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center mt-4 mb-2">
                    <div className="flex space-x-2">
                      {showSearch ? (
                        <div className="flex items-center bg-muted rounded-md">
                          <input
                            type="text"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder="Search in XML..."
                            className="p-1 pl-2 bg-transparent outline-none w-40"
                          />
                          <button
                            onClick={() => {
                              setSearchText("");
                              setShowSearch(false);
                            }}
                            className="p-1 hover:text-primary"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSearch(true)}
                          className="flex items-center"
                        >
                          <Search className="h-4 w-4 mr-1" />
                          Search
                        </Button>
                      )}
                      <Badge className="bg-blue-500">
                        {parsedXml?.pages.length || 0} Pages
                      </Badge>
                      <Badge className="bg-purple-500">
                        Elements:{" "}
                        {parsedXml?.pages.reduce(
                          (acc, page) => acc + page.sections.length,
                          0
                        ) || 0}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyToClipboard}
                        className="flex items-center"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleDownload}
                        className="flex items-center"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>

                  {/* Fixed height XML container */}
                  <div className="border rounded-lg overflow-auto w-[90vh]">
                    <div className="bg-muted p-2 flex justify-between items-center">
                      <Badge variant="outline" className="text-xs">
                        XML Document
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {conversion.xmlContent.length.toLocaleString()}{" "}
                        characters
                      </span>
                    </div>
                    <div className="relative">
                      <pre className="p-4 overflow-auto bg-zinc-950 text-zinc-100 text-sm h-64 leading-relaxed">
                        {searchText ? (
                          <code
                            dangerouslySetInnerHTML={highlightSearch(
                              conversion.xmlContent
                            )}
                          />
                        ) : (
                          <code
                            dangerouslySetInnerHTML={{
                              __html: colorizeXml(conversion.xmlContent),
                            }}
                          />
                        )}
                      </pre>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
