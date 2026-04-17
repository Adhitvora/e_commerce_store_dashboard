import {
  PRODUCT_IMAGE_DEFAULT_BACKGROUND,
  PRODUCT_IMAGE_TARGET_SIZE,
} from "./productImage";

const createImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("We could not load the selected image."));

    if (!String(src || "").startsWith("data:")) {
      image.crossOrigin = "anonymous";
    }

    image.src = src;
  });

const canvasToBlob = (canvas, mimeType, quality) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error("We could not create the cropped image."));
      },
      mimeType,
      quality,
    );
  });

const sanitizeFileName = (fileName = "product-image.jpg") => {
  const safeName = String(fileName)
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${safeName || "product-image"}.jpg`;
};

const clampNumber = (value, min, max) =>
  Math.min(Math.max(value, min), max);

const normalizeCropAreaPixels = (cropAreaPixels, image) => {
  const naturalWidth = image.naturalWidth || image.width || 0;
  const naturalHeight = image.naturalHeight || image.height || 0;

  const x = clampNumber(Math.round(cropAreaPixels?.x || 0), 0, naturalWidth);
  const y = clampNumber(Math.round(cropAreaPixels?.y || 0), 0, naturalHeight);
  const width = clampNumber(
    Math.round(cropAreaPixels?.width || naturalWidth),
    1,
    Math.max(naturalWidth - x, 1),
  );
  const height = clampNumber(
    Math.round(cropAreaPixels?.height || naturalHeight),
    1,
    Math.max(naturalHeight - y, 1),
  );

  return { x, y, width, height };
};

const normalizeSquareCropArea = (cropAreaPixels, image) => {
  const normalizedCropArea = normalizeCropAreaPixels(cropAreaPixels, image);
  const side = Math.max(1, Math.min(normalizedCropArea.width, normalizedCropArea.height));

  return {
    x: normalizedCropArea.x + Math.max(0, Math.round((normalizedCropArea.width - side) / 2)),
    y: normalizedCropArea.y + Math.max(0, Math.round((normalizedCropArea.height - side) / 2)),
    width: side,
    height: side,
  };
};

export const renderProductCropToCanvas = async ({
  imageSrc,
  croppedAreaPixels,
  outputSize = PRODUCT_IMAGE_TARGET_SIZE,
  backgroundColor = PRODUCT_IMAGE_DEFAULT_BACKGROUND,
}) => {
  if (!croppedAreaPixels) {
    throw new Error("Please select a crop area.");
  }

  const image = await createImage(imageSrc);
  const normalizedCropAreaPixels = normalizeSquareCropArea(croppedAreaPixels, image);
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = outputSize;
  outputCanvas.height = outputSize;

  const outputContext = outputCanvas.getContext("2d");
  outputContext.fillStyle = backgroundColor;
  outputContext.fillRect(0, 0, outputSize, outputSize);
  outputContext.imageSmoothingEnabled = true;
  outputContext.imageSmoothingQuality = "high";

  outputContext.drawImage(
    image,
    normalizedCropAreaPixels.x,
    normalizedCropAreaPixels.y,
    normalizedCropAreaPixels.width,
    normalizedCropAreaPixels.height,
    0,
    0,
    outputSize,
    outputSize,
  );

  return {
    canvas: outputCanvas,
    cropAreaPixels: normalizedCropAreaPixels,
    image,
  };
};

export const createCroppedProductImagePreviewUrl = async (options) => {
  const { canvas } = await renderProductCropToCanvas(options);
  const blob = await canvasToBlob(canvas, "image/jpeg", 0.88);
  return URL.createObjectURL(blob);
};

export const createCroppedProductImageFile = async ({
  imageSrc,
  croppedAreaPixels,
  fileName,
  backgroundColor = PRODUCT_IMAGE_DEFAULT_BACKGROUND,
  outputSize = PRODUCT_IMAGE_TARGET_SIZE,
  mimeType = "image/jpeg",
  quality = 0.92,
}) => {
  const { canvas } = await renderProductCropToCanvas({
    imageSrc,
    croppedAreaPixels,
    outputSize,
    backgroundColor,
  });

  const blob = await canvasToBlob(canvas, mimeType, quality);

  return new File([blob], sanitizeFileName(fileName), {
    type: mimeType,
    lastModified: Date.now(),
  });
};
