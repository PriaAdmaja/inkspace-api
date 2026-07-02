import cloudinary from "../configs/cloudinary.js";

export const smallAvatar = (publicId: string) => {
  return cloudinary.url(publicId, {
    width: 64,
    height: 64,
    crop: "fill",
    gravity: "auto",
    quality: "auto",
    fetch_format: "auto",
    secure: true,
  });
};

export const mediumAvatar = (publicId: string) => {
  return cloudinary.url(publicId, {
    width: 256,
    height: 256,
    crop: "fill",
    gravity: "auto",
    quality: "auto",
    fetch_format: "auto",
    secure: true,
  });
};

export const originalImage = (publicId: string) => {
  return cloudinary.url(publicId, {
    quality: "auto",
    secure: true,
  });
};

export const avatarResponse = (publicId: string) => {
  return {
    small: smallAvatar(publicId),
    medium: mediumAvatar(publicId),
    original: originalImage(publicId),
  };
};
