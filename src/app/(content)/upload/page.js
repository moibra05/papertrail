"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Image, FileCheck, Mail, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
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
  const [scrapingEmails, setScrapingEmails] = useState(false);
  const [processingEmails, setProcessingEmails] = useState(false);
  const [emailProgress, setEmailProgress] = useState({ current: 0, total: 0 });
  const [processedReceipts, setProcessedReceipts] = useState([]);
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
      let file_url = "";
      if (formData.file) {
        file_url = await uploadFile(formData.file);
      }

      const saved = await postReceipt({ ...formData, file_url });
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
      userClient.refresh();
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

  const handleScrapeEmails = async () => {
    setScrapingEmails(true);
    setError(null);
    setSuccess(null);
    setProcessedReceipts([]);

    try {
      // Step 1: Run Python scraper to get .eml files
      setSuccess("Running Gmail scraper to download emails...");

      const response = await fetch("/api/scrape-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.auth_required) {
          setError(
            "You must be logged in to scrape emails. Please log in and try again."
          );
        } else if (result.google_required) {
          setError(
            "Gmail access requires Google sign-in. Please sign out and sign in with Google to enable email scraping."
          );
        } else if (result.setup_required) {
          setError(`Gmail not configured: ${result.message}`);
        } else {
          throw new Error(result.error || "Failed to scrape emails");
        }
        return;
      }

      const { eml_files, processed_count } = result;

      if (!eml_files || eml_files.length === 0) {
        setSuccess(
          `Gmail scraper completed but no .eml files found to process.`
        );
        return;
      }

      setSuccess(
        `Found ${eml_files.length} email files. Processing with OCR...`
      );

      setProcessingEmails(true);
      setEmailProgress({ current: 0, total: eml_files.length });

      const processedResults = [];

      for (let i = 0; i < eml_files.length; i++) {
        const emlFile = eml_files[i];
        setEmailProgress({ current: i + 1, total: eml_files.length });

        try {
          // Fetch the .eml file content
          const fileResponse = await fetch(`/api/eml/${emlFile.filename}`);
          if (!fileResponse.ok) {
            throw new Error(`Failed to fetch ${emlFile.filename}`);
          }

          // Create blob with proper MIME type for .eml files
          const fileBuffer = await fileResponse.arrayBuffer();
          const fileBlob = new Blob([fileBuffer], { type: "message/rfc822" });

          // Set the filename property for the blob
          Object.defineProperty(fileBlob, "name", {
            value: emlFile.filename,
            writable: false,
          });

          // Process through extractReceipt (which calls /api/receipts-extract)
          const receiptData = await extractReceipt(fileBlob);

          // Save to database using postReceipt (which calls /api/receipts)
          if (
            receiptData &&
            receiptData.merchant &&
            receiptData.purchase_date &&
            receiptData.total_amount !== null
          ) {
            try {
              // Check for duplicates first
              const duplicateResponse = await fetch(
                "/api/receipts/check-duplicate",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    merchant: receiptData.merchant,
                    purchase_date: receiptData.purchase_date,
                    total_amount: receiptData.total_amount,
                  }),
                }
              );

              if (duplicateResponse.ok) {
                const duplicateResult = await duplicateResponse.json();

                if (duplicateResult.isDuplicate) {
                  console.log(
                    `🔄 Skipping ${emlFile.filename} - duplicate found:`,
                    duplicateResult.existingReceipt
                  );
                  processedResults.push({
                    filename: emlFile.filename,
                    success: true,
                    skipped: true,
                    data: receiptData,
                    reason: "Receipt already exists in database",
                  });
                  continue;
                }
              }

              receiptData.file_url = "gmail.jpg";
              const dbResult = await postReceipt(receiptData);

              processedResults.push({
                filename: emlFile.filename,
                success: true,
                data: receiptData,
                saved: true,
              });
            } catch (dbError) {
              processedResults.push({
                filename: emlFile.filename,
                success: false,
                error: `Database save failed: ${dbError.message}`,
                data: receiptData,
              });
            }
          } else {
            processedResults.push({
              filename: emlFile.filename,
              success: false,
              error: "Incomplete receipt data extracted",
              data: receiptData,
            });
          }
        } catch (fileError) {
          processedResults.push({
            filename: emlFile.filename,
            success: false,
            error: fileError.message,
          });
        }
      }

      setProcessedReceipts(processedResults);
      const successCount = processedResults.filter(
        (r) => r.success && r.saved
      ).length;
      const skippedCount = processedResults.filter(
        (r) => r.success && r.skipped
      ).length;
      const errorCount = processedResults.filter((r) => !r.success).length;

      let statusMessage = `Successfully processed ${successCount} email receipts!`;
      if (skippedCount > 0) {
        statusMessage += ` ${skippedCount} duplicates skipped.`;
      }
      if (errorCount > 0) {
        statusMessage += ` ${errorCount} failed.`;
      }

      setSuccess(statusMessage);

      try {
        const clearResponse = await fetch("/api/clear-emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (clearResponse.ok) {
          const clearResult = await clearResponse.json();
          console.log(
            `🧹 Cleared ${clearResult.cleared_count} email files from folder`
          );
        }
      } catch (clearError) {
        console.warn("Failed to clear emails folder:", clearError);
        // Don't show this error to user as it's not critical
      }
    } catch (err) {
      setError(err.message || "Error scraping emails. Please try again.");
    } finally {
      setScrapingEmails(false);
      setProcessingEmails(false);
      setEmailProgress({ current: 0, total: 0 });
    }
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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Upload Receipt
            </h1>
            <p className="text-muted">
              Scan or upload your receipts to automatically extract expense data
            </p>
          </div>
          <Button
            onClick={handleScrapeEmails}
            disabled={scrapingEmails || processing || processingEmails}
            className="flex items-center gap-2 border-2 bg-blue-500 text-white hover:bg-blue-600 hover:text-white border-blue-500 hover:border-blue-600 dark:bg-transparent dark:text-white dark:border-white dark:hover:border-gray-200 dark:hover:bg-transparent"
            variant="outline"
          >
            <Mail className="h-4 w-4" />
            {scrapingEmails
              ? "Scraping..."
              : processingEmails
              ? "Processing..."
              : "Scrape Gmail"}
          </Button>
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

        {processingEmails && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted">
              <span>
                {`Processing emails (${emailProgress.current}/${emailProgress.total})...`}
              </span>
              <span>
                {`${Math.round(
                  (emailProgress.current / emailProgress.total) * 100
                )}%`}
              </span>
            </div>
            <Progress
              value={(emailProgress.current / emailProgress.total) * 100}
              className="h-2"
            />
          </div>
        )}

        {processedReceipts.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Processed Email Receipts</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {processedReceipts.map((receipt, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded"
                >
                  <span className="text-sm font-mono text-gray-400">
                    {receipt.filename}
                  </span>
                  {receipt.success && receipt.saved ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">
                        {receipt.data?.merchant || "Unknown"} - $
                        {receipt.data?.total_amount || "0"}
                      </span>
                    </div>
                  ) : receipt.success && receipt.skipped ? (
                    <div className="flex items-center gap-2 text-orange-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">
                        {receipt.data?.merchant || "Unknown"} - $
                        {receipt.data?.total_amount || "0"} (Duplicate)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Failed</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
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
                  onManualEntry={() => {
                    setError(null);
                    setSuccess(null);
                    setProgress(0);
                    setExtractedData({});
                  }}
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
