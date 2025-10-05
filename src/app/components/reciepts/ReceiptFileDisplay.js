"use client";

import React from "react";
import { createClient } from "../../../../utils/supabase/client";

export default function ReceiptFileDisplay({ path }) {
  const [fileUrl, setFileUrl] = React.useState(null);
  const [fileType, setFileType] = React.useState(null);
  const [fileText, setFileText] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const supabase = createClient();

  console.log(path);

  React.useEffect(() => {
    if (!path) return;

    const fetchFile = async () => {
      setLoading(true);
      const { data, error } = await supabase.storage
        .from("Receipt Pictures")
        .download(path);

      if (error) {
        console.error("Error downloading file:", error);
        setLoading(false);
        return;
      }

      const blob = data;
      const type = blob.type || "application/octet-stream";
      setFileType(type);

      // Create an object URL for display
      const url = URL.createObjectURL(blob);
      setFileUrl(url);

      // If it's text, read it as string
      if (type.startsWith("text/") || type === "application/json") {
        const text = await blob.text();
        setFileText(text);
      }

      setLoading(false);
    };

    fetchFile();
  }, [path]);

  if (loading) return <p>Loading preview...</p>;
  if (!fileUrl) return <p>No file found.</p>;

  // === IMAGE ===
  if (fileType?.startsWith("image/")) {
    return (
      <div className="w-full flex justify-center">
        <img
          src={fileUrl}
          alt="Uploaded file"
          className="max-h-[400px] rounded-lg shadow-md"
        />
      </div>
    );
  }

  // === PDF ===
  if (fileType === "application/pdf") {
    return (
      <iframe
        src={fileUrl}
        className="w-full h-[600px] border rounded-lg"
        title="PDF Preview"
      />
    );
  }

  // === TEXT ===
  if (fileType?.startsWith("text/") || fileType === "application/json") {
    return (
      <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
        {fileText}
      </pre>
    );
  }

  // === FALLBACK ===
  return (
    <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
      <p>Preview not available for this file type ({fileType})</p>
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline"
      >
        Download file
      </a>
    </div>
  );
}
