export function isAllowedReceiptFile(file) {
  if (!file) return false;

  const mime = file.type?.toLowerCase() || "";
  const name = file.name?.toLowerCase() || "";

  const allowedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/heic",
    "image/tiff",
  ];

  const allowedTextTypes = [
    "text/plain",
    "text/markdown",
    "text/csv",
    "application/json",
    "message/rfc822", // .eml
  ];

  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".heic",
    ".tiff",
    ".pdf",
    ".txt",
    ".md",
    ".markdown",
    ".csv",
    ".json",
    ".eml",
    ".log",
  ];

  if (
    allowedImageTypes.includes(mime) ||
    allowedTextTypes.includes(mime) ||
    mime === "application/pdf"
  ) {
    return true;
  }

  return allowedExtensions.some((ext) => name.endsWith(ext));
}

export function hasNonBlankValue(obj) {
  for (const key in obj) {
    const value = obj[key];
    if (
      value !== "" &&
      value !== undefined &&
      value !== null &&
      !(Array.isArray(value) && value.length === 0) &&
      !(typeof value === "string" && value.trim() === "")
    ) {
      return true;
    }
  }
  return false;
}
