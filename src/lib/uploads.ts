import { randomUUID } from "crypto";
import { put, del } from "@vercel/blob";

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
};

export async function saveUploadedFile(file: File) {
  if (!ALLOWED_TYPES[file.type]) {
    throw new Error("Chỉ chấp nhận file PDF, JPG hoặc PNG");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File vượt quá dung lượng cho phép (10MB)");
  }

  const extension = ALLOWED_TYPES[file.type];
  const pathname = `medical-records/${randomUUID()}${extension}`;

  const blob = await put(pathname, file, {
    access: "private",
    addRandomSuffix: true,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return {
    filePath: blob.url,
    fileType: file.type,
    fileSize: file.size,
  };
}

export async function deleteUploadedFile(url: string) {
  await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
}
