import React from "react";
import { Card } from "@/components/ui/card";
import { Upload, Camera, FileText, ImageIcon } from "lucide-react";
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
        video: { facingMode: 'environment' },
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], `receipt-${Date.now()}.jpg`, { type: 'image/jpeg' });
      onFileSelect({ target: { files: [file] } });
      stopCamera();
    }, 'image/jpeg', 0.95);
  };

  React.useEffect(() => {
    return () => stopCamera();
  }, []);

  if (showCamera) {
    return (
      <Card className="border-2 border-indigo-200 bg-white/80 backdrop-blur-sm shadow-xl">
        <div className="p-6">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-lg bg-black"
          />
          <div className="flex gap-3 mt-4">
            <Button
              onClick={capturePhoto}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Camera className="w-4 h-4 mr-2" />
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
        className={`border-2 border-dashed transition-all duration-300 ${
          dragActive 
            ? "border-indigo-500 bg-indigo-50" 
            : "border-slate-200 bg-white/80 hover:border-indigo-300"
        } backdrop-blur-sm shadow-lg`}
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
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl"
          >
            <Upload className="w-10 h-10 text-white" />
          </motion.div>
          
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Upload Receipt</h3>
          <p className="text-slate-500 mb-6">
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
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
            >
              <FileText className="w-4 h-4 mr-2" />
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

          <p className="text-xs text-slate-400 mt-6">
            Supports: JPG, PNG, PDF • Max 10MB per file
          </p>
        </div>
      </Card>
    </div>
  );
}