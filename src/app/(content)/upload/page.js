"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Image, FileCheck, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import UploadZone from "../../components/upload/UploadZone";
import ReceiptForm from "../../components/upload/ReceiptForm";
import { useReceiptExtraction } from "@/hooks/use-receipt-extraction";
import { useReceiptPost } from "@/hooks/use-receipt-post";
import { isAllowedReceiptFile } from "@/utils/shared";
import { useUserClient } from "@/providers/UserProvider";

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
      await postReceipt(formData);
      setSuccess("Receipt saved successfully!");
      userClient.refresh();
      setTimeout(() => {
        router.push("/receipts-extract");
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

  const handleScrapeEmails = async () => {
    setScrapingEmails(true);
    setError(null);
    setSuccess(null);
    setProcessedReceipts([]);

    try {
      // Step 1: Run Python scraper to get .eml files
      setSuccess('Running Gmail scraper to download emails...');
      
      const response = await fetch('/api/scrape-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.auth_required) {
          setError('You must be logged in to scrape emails. Please log in and try again.');
        } else if (result.google_required) {
          setError('Gmail access requires Google sign-in. Please sign out and sign in with Google to enable email scraping.');
        } else if (result.setup_required) {
          setError(`Gmail not configured: ${result.message}`);
        } else {
          throw new Error(result.error || 'Failed to scrape emails');
        }
        return;
      }

      const { eml_files, processed_count } = result;
      
      if (!eml_files || eml_files.length === 0) {
        setSuccess(`Gmail scraper completed but no .eml files found to process.`);
        return;
      }

      setSuccess(`Found ${eml_files.length} email files. Processing with OCR...`);

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
          const fileBlob = new Blob([fileBuffer], { type: 'message/rfc822' });
          
          // Set the filename property for the blob
          Object.defineProperty(fileBlob, 'name', {
            value: emlFile.filename,
            writable: false
          });
          
          // Process through extractReceipt (which calls /api/receipts-extract)
          const receiptData = await extractReceipt(fileBlob);

          
          // Save to database using postReceipt (which calls /api/receipts)
          if (receiptData && receiptData.merchant && receiptData.purchase_date && receiptData.total_amount !== null) {
            
            try {
              // Check for duplicates first
              const duplicateResponse = await fetch('/api/receipts/check-duplicate', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  merchant: receiptData.merchant,
                  purchase_date: receiptData.purchase_date,
                  total_amount: receiptData.total_amount
                })
              });
              
              if (duplicateResponse.ok) {
                const duplicateResult = await duplicateResponse.json();
                
                if (duplicateResult.isDuplicate) {
                  console.log(`🔄 Skipping ${emlFile.filename} - duplicate found:`, duplicateResult.existingReceipt);
                  processedResults.push({
                    filename: emlFile.filename,
                    success: true,
                    skipped: true,
                    data: receiptData,
                    reason: 'Receipt already exists in database'
                  });
                  continue;
                }
              }
              
              const dbResult = await postReceipt(receiptData);
              
              processedResults.push({
                filename: emlFile.filename,
                success: true,
                data: receiptData,
                saved: true
              });
            } catch (dbError) {
              processedResults.push({
                filename: emlFile.filename,
                success: false,
                error: `Database save failed: ${dbError.message}`,
                data: receiptData
              });
            }
          } else {
            processedResults.push({
              filename: emlFile.filename,
              success: false,
              error: 'Incomplete receipt data extracted',
              data: receiptData
            });
          }
          
        } catch (fileError) {
          processedResults.push({
            filename: emlFile.filename,
            success: false,
            error: fileError.message
          });
        }
      }
      
      setProcessedReceipts(processedResults);
      const successCount = processedResults.filter(r => r.success && r.saved).length;
      const skippedCount = processedResults.filter(r => r.success && r.skipped).length;
      const errorCount = processedResults.filter(r => !r.success).length;
      
      let statusMessage = `Successfully processed ${successCount} email receipts!`;
      if (skippedCount > 0) {
        statusMessage += ` ${skippedCount} duplicates skipped.`;
      }
      if (errorCount > 0) {
        statusMessage += ` ${errorCount} failed.`;
      }
      
      setSuccess(statusMessage);
      
      try {
        const clearResponse = await fetch('/api/clear-emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (clearResponse.ok) {
          const clearResult = await clearResponse.json();
          console.log(`🧹 Cleared ${clearResult.cleared_count} email files from folder`);
        }
      } catch (clearError) {
        console.warn('Failed to clear emails folder:', clearError);
        // Don't show this error to user as it's not critical
      }

    } catch (err) {
      setError(err.message || 'Error scraping emails. Please try again.');
    } finally {
      setScrapingEmails(false);
      setProcessingEmails(false);
      setEmailProgress({ current: 0, total: 0 });
    }
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
            {scrapingEmails ? 'Scraping...' : processingEmails ? 'Processing...' : 'Scrape Gmail'}
          </Button>
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

        {(processing && !extractedData) || processingEmails ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted">
              <span>
                {processingEmails 
                  ? `Processing emails (${emailProgress.current}/${emailProgress.total})...` 
                  : 'Processing receipt...'
                }
              </span>
              <span>
                {processingEmails 
                  ? `${Math.round((emailProgress.current / emailProgress.total) * 100)}%`
                  : `${progress}%`
                }
              </span>
            </div>
            <Progress 
              value={processingEmails 
                ? (emailProgress.current / emailProgress.total) * 100 
                : progress
              } 
              className="h-2" 
            />
          </div>
        ) : null}

        {processedReceipts.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Processed Email Receipts</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {processedReceipts.map((receipt, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                  <span className="text-sm font-mono text-gray-400">{receipt.filename}</span>
                  {receipt.success && receipt.saved ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">
                        {receipt.data?.merchant || 'Unknown'} - ${receipt.data?.total_amount || '0'}
                      </span>
                    </div>
                  ) : receipt.success && receipt.skipped ? (
                    <div className="flex items-center gap-2 text-orange-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">
                        {receipt.data?.merchant || 'Unknown'} - ${receipt.data?.total_amount || '0'} (Duplicate)
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
