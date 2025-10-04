"use client";

import React, { useState } from "react";
// import { UploadFile, ExtractDataFromUploadedFile } from "@/integrations/Core";
import { Card } from "@/components/ui/card";
import { FileText, Image, FileCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

import UploadZone from "../../components/upload/UploadZone";
import ReceiptForm from "../../components/upload/ReceiptForm";
import { useReceiptExtraction } from "@/hooks/use-receipt-extraction";
import { isAllowedReceiptFile } from "@/utils/shared";

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const {
    extractReceipt,
    isLoading: isExtractReceiptLoading,
    isError: isExtractReceiptError,
  } = useReceiptExtraction();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleFileSelect = async (e) => {
    setError(null);
    setSuccess(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!isAllowedReceiptFile(file)) {
      setError("Please upload an image, text or PDF file");
      return;
    }

    setProcessing(true);
    setProgress(10);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 80));
      }, 200);
      
      
      setProgress(85);
      const receipt = await extractReceipt(file);

      clearInterval(progressInterval);
      setProgress(100);
      if (!isExtractReceiptError) {
        setExtractedData(receipt);
      } else {
        throw new Error("Could not extract data from receipt");
      }
    } catch (err) {
      setError(err.message || "Error processing receipt. Please try again.");
      setProgress(0);
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = async (formData) => {
    setProcessing(true);
    try {
      await Receipt.create(formData);
      setSuccess("Receipt saved successfully!");
      setTimeout(() => {
        navigate(createPageUrl("Receipts"));
      }, 1500);
    } catch (err) {
      setError("Error saving receipt. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    setExtractedData(null);
    setProgress(0);
  };

  return (
    <div className="p-4 md:p-8 min-h-full">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Upload Receipt
          </h1>
          <p className="text-slate-600">
            Scan or upload your receipts to automatically extract expense data
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {processing && !extractedData && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Processing receipt...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {!extractedData ? (
          <div className="flex flex-col gap-5">
            <div>
              <Card className="p-6">
                <h3 className="font-semibold">How it works</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">1. Upload Receipt</h4>
                      <p className="text-sm text-muted-foreground">
                        Drag and drop or select receipt images and PDFs
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Image className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">2. AI Processing</h4>
                      <p className="text-sm text-muted-foreground">
                        OCR extracts merchant, date, amount, and category
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileCheck className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">3. Review & Save</h4>
                      <p className="text-sm text-muted-foreground">
                        Verify extracted data and organize into folders
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            <div>
              <UploadZone
                onFileSelect={handleFileSelect}
                dragActive={dragActive}
                onDrag={handleDrag}
              />
            </div>
          </div>
        ) : (
          <ReceiptForm
            extractedData={extractedData}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}
