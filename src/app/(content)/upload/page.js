"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { FileText, Image, FileCheck, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import UploadZone from "../../components/upload/UploadZone";
import ReceiptForm from "../../components/upload/ReceiptForm";
import { useReceiptExtraction } from "@/hooks/use-receipt-extraction";
import { useReceiptPost } from "@/hooks/use-receipt-post";
import { useUserClient } from "@/providers/UserProvider";
import { isAllowedReceiptFile } from "@/utils/shared";
import uploadFile from "./upload-file";

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
  const { postReceipt } = useReceiptPost();
  const router = useRouter();
  const userClient = useUserClient();
  const [isAlertHovered, setIsAlertHovered] = useState(false);
  const timeoutRef = useRef(null);
  const [isErrorHovered, setIsErrorHovered] = useState(false);
  const errorTimeoutRef = useRef(null);

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
      receipt.file = file;
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
      let fileUrl = "";
      if (formData.file) {
        fileUrl = await uploadFile(formData.file);
      }

      const saved = await postReceipt({ ...formData, fileUrl });
      if (!saved || saved.error) {
        throw new Error(saved?.error || "Failed to save receipt");
      }
      // refresh user-level data so receipts list reflects the new entry
      try {
        await userClient.refresh();
      } catch (e) {
        // non-fatal: log and continue navigation
        console.warn("Failed to refresh user data:", e);
      }
      setSuccess("Receipt saved successfully!");
      setTimeout(() => {
        router.push("/receipts");
      }, 1000);
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

  // compute total from items and tax and update formData
  const computeAndSetTotal = (newItems) => {
    const itemsSum = newItems.reduce(
      (acc, it) =>
        acc +
        (Number(it.total) ||
          Number(it.quantity || 0) * Number(it.unit_price || 0)),
      0
    );
    const tax = Number(formData.tax_amount) || 0;
    const newTotal = Number((itemsSum + tax).toFixed(2));
    setFormData((prev) => ({
      ...prev,
      items: newItems,
      total_amount: newTotal,
    }));
  };

  useEffect(() => {
    // auto-hide success alert after 5s, but pause when hovered
    if (!success) return;
    // clear any existing timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const startTimer = () => {
      timeoutRef.current = setTimeout(() => {
        setSuccess(null);
      }, 5000);
    };

    if (!isAlertHovered) startTimer();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [success, isAlertHovered]);

  const closeAlert = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setSuccess(null);
  };

  useEffect(() => {
    // auto-hide error alert after 5s, but pause when hovered
    if (!error) return;
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }

    const startTimer = () => {
      errorTimeoutRef.current = setTimeout(() => {
        setError(null);
      }, 5000);
    };

    if (!isErrorHovered) startTimer();

    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = null;
      }
    };
  }, [error, isErrorHovered]);

  const closeError = () => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
    setError(null);
  };
  return (
    <div className="p-4 md:p-8 min-h-full">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Upload Receipt
          </h1>
          <p className="text-muted">
            Scan or upload your receipts to automatically extract expense data
          </p>
        </div>

        {error && (
          <div
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-lg px-4"
            onMouseEnter={() => setIsErrorHovered(true)}
            onMouseLeave={() => setIsErrorHovered(false)}
          >
            <Alert
              variant="destructive"
              className="shadow-lg flex items-center justify-between gap-3"
              role="alert"
              aria-live="assertive"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="truncate">
                  {error}
                </AlertDescription>
              </div>
              <button
                onClick={closeError}
                aria-label="Dismiss"
                className="p-2 rounded hover:bg-black/5"
              >
                <X className="w-4 h-4" />
              </button>
            </Alert>
          </div>
        )}

        {success && (
          <div
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-lg px-4"
            onMouseEnter={() => setIsAlertHovered(true)}
            onMouseLeave={() => setIsAlertHovered(false)}
          >
            <Alert
              className="border-green-200 bg-green-50 text-green-800 shadow-lg flex items-center justify-between gap-3"
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="truncate">
                  {success}
                </AlertDescription>
              </div>
              <button
                onClick={closeAlert}
                aria-label="Dismiss"
                className="p-2 rounded hover:bg-black/5"
              >
                <X className="w-4 h-4" />
              </button>
            </Alert>
          </div>
        )}

        {!extractedData ? (
          <div className="flex flex-col gap-5">
            <div>
              <Card className="p-6 bg-surface">
                <h3 className="font-semibold">How it works</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">1. Upload Receipt</h4>
                      <p className="text-sm text-muted">
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
                      <p className="text-sm text-muted">
                        OCR extracts merchant, purchase date, amount, and
                        category
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileCheck className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">3. Review & Save</h4>
                      <p className="text-sm text-muted">
                        Verify extracted data and organize into folders
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            {processing && !extractedData && (
              <div className="flex justify-center">
                <div className="w-full h-full">
                  <Card className="p-8 flex flex-col items-center justify-center bg-surface">
                    <div className="mb-4 text-center text-muted">
                      Processing receipt...
                    </div>
                    <div className="flex items-center justify-center">
                      <div
                        className="w-18 h-18 border-8 border-gray-200 border-t-blue-500 rounded-full animate-spin"
                        aria-hidden
                      />
                    </div>
                  </Card>
                </div>
              </div>
            )}
            <div>
              {!processing ? (
                <UploadZone
                  onFileSelect={handleFileSelect}
                  dragActive={dragActive}
                  onDrag={handleDrag}
                />
              ) : null}
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
