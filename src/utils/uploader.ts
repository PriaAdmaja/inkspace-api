import { UploadApiResponse } from "cloudinary";
import cloudinary from "../configs/cloudinary.js";

export const imageUploader = async (file: File, name: string): Promise<UploadApiResponse> => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
console.log(buffer)
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: name,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result!);
      },
    );

    stream.end(buffer);
  });
};
