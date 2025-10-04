import React from "react";
import { Card } from "@/components/ui/card";
import { Upload, Camera, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function UploadZone({ onFileSelect, dragActive, onDrag }) {
  const fileInputRef = React.useRef(null);
  const [showCamera, setShowCamera] = React.useState(false);
  const videoRef = React.useRef(null);
  const streamRef = React.useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      setShowCamera(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch (e) {
        console.warn("Failed to pause video element:", e);
      }
      try {
        videoRef.current.srcObject = null;
      } catch (e) {
        console.warn("Failed to clear video element srcObject:", e);
      }
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(
      (blob) => {
        const file = new File([blob], `receipt-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onFileSelect({ target: { files: [file] } });
        stopCamera();
      },
      "image/jpeg",
      0.95
    );
  };

  React.useEffect(() => {
    return () => stopCamera();
  }, []);

  // When showCamera becomes true and the video element is mounted,
  // attach the MediaStream and ensure playback starts.
  React.useEffect(() => {
    if (!showCamera) return;
    const v = videoRef.current;
    const s = streamRef.current;
    if (!v || !s) return;

    v.srcObject = s;

    const tryPlay = async () => {
      try {
        await v.play();
      } catch (playErr) {
        console.warn("Video play() promise rejected (deferred):", playErr);
        // As a fallback, wait for loadedmetadata and try again once
        const onLoaded = () => {
          v.play().catch((e) =>
            console.warn("play() failed after loadedmetadata:", e)
          );
        };
        v.addEventListener("loadedmetadata", onLoaded, { once: true });
      }
    };

    tryPlay();

    return () => {
      try {
        v.pause();
      } catch (e) {
        console.warn("Failed to pause video:", e);
      }
      try {
        v.srcObject = null;
      } catch (e) {
        console.warn("Failed to clear video srcObject:", e);
      }
    };
  }, [showCamera]);

  if (showCamera) {
    return (
      <Card className="border-2 border-blue-200 bg-surface backdrop-blur-sm shadow-xl">
        <div className="p-6">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-[60vh] md:h-[72vh] max-h-[80vh] rounded-lg bg-black object-cover"
          />
          <div className="flex gap-3 mt-4">
            <Button
              onClick={capturePhoto}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg dark:shadow-gray-500/10"
            >
              <Camera className="w-4 h-4 mr-2 text-white" />
              Capture
            </Button>
            <Button variant="outline" onClick={stopCamera}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card
        className={`border-2 transition-all duration-300 ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-subtle bg-surface hover:border-blue-300"
        } backdrop-blur-sm shadow-lg dark:shadow-gray-500/10`}
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDrag(e);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileSelect({ target: { files: e.dataTransfer.files } });
          }
        }}
      >
        <div className="p-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl"
          >
            <Upload className="w-10 h-10 text-white" />
          </motion.div>
          
          <h3 className="text-2xl font-bold text-foreground mb-2">Upload Receipt</h3>
          <p className="text-muted mb-6">
            Drag and drop your receipt here, or click to browse
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            multiple
            onChange={onFileSelect}
            className="hidden"
          />

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 shadow-lg dark:shadow-gray-500/10 text-white"
            >
              <FileText className="w-4 h-4 mr-2 text-white" />
              Browse Files
            </Button>
            <Button
              onClick={startCamera}
              variant="outline"
              className="border-indigo-200 hover:bg-indigo-50"
            >
              <Camera className="w-4 h-4 mr-2" />
              Use Camera
            </Button>
          </div>

          <p className="text-xs text-muted mt-6">
            Supports: JPG, PNG, PDF • Max 10MB per file
          </p>
        </div>
      </Card>
    </div>
  );
}
