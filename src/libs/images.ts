import { UploadApiResponse } from "cloudinary";
import cloudinary from "../configs/cloudinary.js";

export const imageUploader = async ({
  file,
  folderName,
  name,
}: {
  file: File;
  folderName: string;
  name: string;
}): Promise<UploadApiResponse> => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        public_id: name,
        resource_type: "image",
        overwrite: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result!);
      },
    );

    stream.end(buffer);
  });
};

export const deleteImage = async (publicId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error) => {
      if (error) return reject(error);
      resolve();
    });
  });
};
