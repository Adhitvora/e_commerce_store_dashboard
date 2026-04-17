export const PRODUCT_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
export const PRODUCT_IMAGE_TARGET_SIZE = 800;
export const PRODUCT_IMAGE_BACKGROUND_VARIABLE = "--product-image-bg";
export const PRODUCT_IMAGE_DEFAULT_BACKGROUND = "#efe9e2";
export const PRODUCT_IMAGE_HELPER_TEXT = `Accepted formats: JPG, PNG, and WEBP. You can crop each image to a square or skip cropping and keep the original framing. Final product images always render inside the platform background instead of white.`;

const PRODUCT_IMAGE_TYPES = new Set(PRODUCT_IMAGE_ACCEPT.split(","));

const HEX_COLOR_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB_COLOR_PATTERN =
  /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i;

const createPreviewId = (fileName = "product-image") =>
  `${fileName}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const isValidBackgroundColor = (value = "") =>
  HEX_COLOR_PATTERN.test(value) || RGB_COLOR_PATTERN.test(value);

export const getProductImageWarnings = (width, height) => {
  const warnings = [];

  if (!width || !height) {
    return warnings;
  }

  if (width !== height) {
    warnings.push("Adjust the crop to frame the image cleanly inside the square output.");
  }

  if (width < PRODUCT_IMAGE_TARGET_SIZE || height < PRODUCT_IMAGE_TARGET_SIZE) {
    warnings.push(
      `Low resolution (${width}x${height}). ${PRODUCT_IMAGE_TARGET_SIZE}x${PRODUCT_IMAGE_TARGET_SIZE} or larger looks best.`,
    );
  }

  return warnings;
};

export const getProductImageThemeBackground = () => {
  if (typeof window === "undefined") {
    return PRODUCT_IMAGE_DEFAULT_BACKGROUND;
  }

  const cssValue = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue(PRODUCT_IMAGE_BACKGROUND_VARIABLE)
    .trim();

  return isValidBackgroundColor(cssValue)
    ? cssValue
    : PRODUCT_IMAGE_DEFAULT_BACKGROUND;
};

export const createRemoteProductImagePreview = (url, index) => ({
  id: `remote-product-image-${index}`,
  file: null,
  url,
  name: `Product image ${index + 1}`,
  width: null,
  height: null,
  originalWidth: null,
  originalHeight: null,
  outputWidth: PRODUCT_IMAGE_TARGET_SIZE,
  outputHeight: PRODUCT_IMAGE_TARGET_SIZE,
  warnings: [],
  mode: "server",
  serverUrl: url,
});

export const revokeProductImagePreview = (preview) => {
  if (preview?.url && preview.url.startsWith("blob:")) {
    URL.revokeObjectURL(preview.url);
  }
};

export const revokeProductImagePreviews = (previews = []) => {
  previews.forEach(revokeProductImagePreview);
};

export const createProductImagePreview = (file) =>
  new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("Please select a valid image file."));
      return;
    }

    if (file.type && !PRODUCT_IMAGE_TYPES.has(file.type)) {
      reject(new Error("Only JPG, PNG, and WEBP product images are allowed."));
      return;
    }

    const url = URL.createObjectURL(file);
    const image = new window.Image();

    image.onload = () => {
      const warnings = getProductImageWarnings(
        image.naturalWidth,
        image.naturalHeight,
      );

      resolve({
        id: createPreviewId(file.name),
        file,
        url,
        name: file.name,
        width: image.naturalWidth,
        height: image.naturalHeight,
        originalWidth: image.naturalWidth,
        originalHeight: image.naturalHeight,
        outputWidth: image.naturalWidth,
        outputHeight: image.naturalHeight,
        warnings,
        mode: "original",
        serverUrl: null,
      });
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`We could not read "${file.name}". Please choose another image.`));
    };

    image.src = url;
  });

export const buildCroppedProductImagePreview = async (
  file,
  sourcePreview,
) => {
  const preview = await createProductImagePreview(file);

  return {
    ...preview,
    warnings: sourcePreview?.warnings || [],
    originalWidth: sourcePreview?.width || sourcePreview?.originalWidth || null,
    originalHeight: sourcePreview?.height || sourcePreview?.originalHeight || null,
    outputWidth: preview.width,
    outputHeight: preview.height,
    mode: "cropped",
    serverUrl: sourcePreview?.serverUrl || null,
  };
};

export const createProductImagePreviewBatch = async (fileList) => {
  const files = Array.from(fileList || []);
  const results = await Promise.allSettled(
    files.map((file) => createProductImagePreview(file)),
  );

  return results.reduce(
    (accumulator, result) => {
      if (result.status === "fulfilled") {
        accumulator.previews.push(result.value);
      } else {
        accumulator.errors.push(
          result.reason?.message ||
            "We could not prepare one of the selected images.",
        );
      }

      return accumulator;
    },
    { previews: [], errors: [] },
  );
};
