// File: app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  FileText,
  FileCode,
  Zap,
  Shield,
  Clock,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col w-screen">
      {/* Navigation */}
      <header className="border-b w-full">
        <div className="container flex items-center justify-between h-16 px-4 md:px-6">
          <div className="flex items-center gap-2 font-bold text-xl">
            <FileCode className="h-6 w-6" />
            <span>PDFtoXML</span>
          </div>
          <nav className="hidden md:flex gap-6 items-center">
            <Link
              href="#features"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              How It Works
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 w-full">
        <div className="container flex flex-col items-center justify-center gap-6 py-24 md:py-32 text-center">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Convert PDF to XML with Precision
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Transform your PDF documents into structured XML data quickly,
              accurately, and securely.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#how-it-works">Learn More</Link>
            </Button>
          </div>
          <div className="relative mt-8 w-full max-w-4xl rounded-lg border bg-background p-4 shadow-md">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex gap-6 md:gap-12 items-center justify-center mb-6">
                <div className="flex flex-col items-center">
                  <FileText className="h-12 w-12 mb-2 text-primary" />
                  <span className="text-sm">PDF Document</span>
                </div>
                <ArrowRight className="h-8 w-8" />
                <div className="flex items-center justify-center p-4 rounded-full bg-primary/10">
                  <Zap className="h-8 w-8 text-primary animate-pulse" />
                </div>
                <ArrowRight className="h-8 w-8" />
                <div className="flex flex-col items-center">
                  <FileCode className="h-12 w-12 mb-2 text-primary" />
                  <span className="text-sm">XML Data</span>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground max-w-md">
                Our advanced conversion engine preserves structure and
                formatting while turning your PDFs into clean, well-formatted
                XML.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-muted/50 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              Powerful Features
            </h2>
            <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground">
              Everything you need for reliable PDF to XML conversion
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center p-6 space-y-4 rounded-lg border bg-background shadow-sm">
              <Zap className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Convert even complex PDFs in seconds with our optimized
                conversion engine.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 space-y-4 rounded-lg border bg-background shadow-sm">
              <FileCode className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold">Accurate Conversion</h3>
              <p className="text-muted-foreground">
                Our AI-powered engine preserves document structure and
                formatting with high fidelity.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 space-y-4 rounded-lg border bg-background shadow-sm">
              <Shield className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold">Secure Processing</h3>
              <p className="text-muted-foreground">
                Your documents are encrypted and permanently deleted after
                processing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground">
              Three simple steps to convert your PDFs to XML
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative flex flex-col items-center text-center p-6 space-y-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold mb-2">
                1
              </div>
              <h3 className="text-xl font-bold">Upload</h3>
              <p className="text-muted-foreground">
                Upload your PDF documents through our secure interface.
              </p>
            </div>
            <div className="relative flex flex-col items-center text-center p-6 space-y-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold mb-2">
                2
              </div>
              <h3 className="text-xl font-bold">Convert</h3>
              <p className="text-muted-foreground">
                Our engine processes your document and extracts structured data.
              </p>
            </div>
            <div className="relative flex flex-col items-center text-center p-6 space-y-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold mb-2">
                3
              </div>
              <h3 className="text-xl font-bold">Download</h3>
              <p className="text-muted-foreground">
                Download your XML file or integrate with our API for automated
                workflows.
              </p>
            </div>
          </div>
          <div className="mt-12 text-center">
            <Button size="lg" asChild>
              <Link href="/signup">
                Try It Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              Ready to Convert?
            </h2>
            <p className="mx-auto max-w-[700px]">
              Sign up today and get 10 free conversions to experience the power
              of our PDF to XML converter.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/signup">Sign Up Free</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <FileCode className="h-5 w-5" />
              <span className="font-semibold">PDFtoXML</span>
            </div>
            <div className="flex gap-6">
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:underline"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:underline"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:underline"
              >
                Contact
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 PDFtoXML. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
