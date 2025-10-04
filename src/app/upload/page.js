import React, { useState } from "react";
import { Receipt } from "@/entities/Receipt";
import { UploadFile, ExtractDataFromUploadedFile } from "@/integrations/Core";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Progress } from "@/components/ui/progress";

import UploadZone from "../components/upload/UploadZone";
import ReceiptForm from "../components/upload/ReceiptForm";

export default function UploadPage() {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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
    if (!file.type.match(/image.*/) && file.type !== 'application/pdf') {
      setError("Please upload an image or PDF file");
      return;
    }

    setProcessing(true);
    setProgress(10);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 80));
      }, 200);

      const { file_url } = await UploadFile({ file });
      setProgress(85);

      const result = await ExtractDataFromUploadedFile({
        file_url,
        json_schema: Receipt.schema()
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (result.status === "success" && result.output) {
        setExtractedData({
          ...result.output,
          file_url
        });
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
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Upload Receipt
          </h1>
          <p className="text-slate-600">
            Scan or upload your receipt and let AI extract the details
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
          <UploadZone
            onFileSelect={handleFileSelect}
            dragActive={dragActive}
            onDrag={handleDrag}
          />
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