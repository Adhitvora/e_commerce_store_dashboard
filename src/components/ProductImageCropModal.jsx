import React, { useEffect, useMemo, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { FiMinus, FiPlus, FiX } from "react-icons/fi";
import ProductImage from "./ProductImage";
import {
  PRODUCT_IMAGE_DEFAULT_BACKGROUND,
  PRODUCT_IMAGE_TARGET_SIZE,
} from "../utils/productImage";
import {
  createCroppedProductImageFile,
  createCroppedProductImagePreviewUrl,
} from "../utils/cropImage";

const MAX_ZOOM = 3;
const PREVIEW_MODE_CROPPED = "cropped";
const PREVIEW_MODE_ORIGINAL = "original";

const getDefaultCropAreaSize = () => {
  if (typeof window === "undefined") {
    return 320;
  }

  if (window.innerWidth < 640) {
    return Math.max(Math.min(window.innerWidth - 32, 360), 220);
  }

  if (window.innerWidth < 1024) {
    return 360;
  }

  return 420;
};

const getDynamicMinZoom = (cropSize, mediaSize) => {
  if (!cropSize?.width || !cropSize?.height || !mediaSize?.width || !mediaSize?.height) {
    return 1;
  }

  return clampValue(
    Math.min(
      cropSize.width / mediaSize.width,
      cropSize.height / mediaSize.height,
    ),
    0.05,
    1,
  );
};

const ProductImageCropModal = ({
  image,
  backgroundColor = PRODUCT_IMAGE_DEFAULT_BACKGROUND,
  onCancel,
  onConfirm,
  onSkip,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [submitMode, setSubmitMode] = useState("");
  const [previewMode, setPreviewMode] = useState(PREVIEW_MODE_CROPPED);
  const [cropAreaSize, setCropAreaSize] = useState(getDefaultCropAreaSize);
  const [cropSize, setCropSize] = useState(null);
  const [mediaSize, setMediaSize] = useState(null);
  const previewUrlRef = useRef("");
  const hasInitializedZoomRef = useRef(false);

  useEffect(() => {
    if (!image) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [image]);

  useEffect(() => {
    const handleResize = () => {
      setCropAreaSize(getDefaultCropAreaSize());
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setMinZoom(1);
    setCroppedAreaPixels(null);
    setPreviewMode(PREVIEW_MODE_CROPPED);
    setSubmitMode("");
    setCropSize(null);
    setMediaSize(null);
    hasInitializedZoomRef.current = false;
  }, [image?.id]);

  useEffect(() => {
    const nextMinZoom = getDynamicMinZoom(cropSize, mediaSize);

    setMinZoom(nextMinZoom);
    setZoom((currentZoom) => {
      if (!hasInitializedZoomRef.current) {
        hasInitializedZoomRef.current = true;
        return nextMinZoom;
      }

      return clampValue(currentZoom, nextMinZoom, MAX_ZOOM);
    });
  }, [cropSize, mediaSize]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let isCurrent = true;

    if (!image?.url || !croppedAreaPixels) {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = "";
      }
      setPreviewUrl("");
      return undefined;
    }

    const timerId = window.setTimeout(async () => {
      try {
        const nextPreviewUrl = await createCroppedProductImagePreviewUrl({
          imageSrc: image.url,
          croppedAreaPixels,
          backgroundColor,
        });

        if (!isCurrent) {
          URL.revokeObjectURL(nextPreviewUrl);
          return;
        }

        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current);
        }

        previewUrlRef.current = nextPreviewUrl;
        setPreviewUrl(nextPreviewUrl);
      } catch {
        if (!isCurrent) {
          return;
        }

        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current);
          previewUrlRef.current = "";
        }

        setPreviewUrl("");
      }
    }, 120);

    return () => {
      isCurrent = false;
      window.clearTimeout(timerId);
    };
  }, [backgroundColor, croppedAreaPixels, image?.url]);

  const details = useMemo(() => {
    if (!image) {
      return [];
    }

    return [
      image.width && image.height
        ? `Original: ${image.width}x${image.height}px`
        : null,
      croppedAreaPixels
        ? `Selected crop: ${Math.round(croppedAreaPixels.width)}x${Math.round(croppedAreaPixels.height)}px`
        : null,
      `Output: ${PRODUCT_IMAGE_TARGET_SIZE}x${PRODUCT_IMAGE_TARGET_SIZE}px`,
    ].filter(Boolean);
  }, [croppedAreaPixels, image]);

  if (!image) {
    return null;
  }

  const handleSave = async () => {
    if (!croppedAreaPixels) {
      return;
    }

    setSubmitMode(PREVIEW_MODE_CROPPED);

    try {
      const croppedFile = await createCroppedProductImageFile({
        imageSrc: image.url,
        croppedAreaPixels,
        fileName: image.name,
        backgroundColor,
      });

      await onConfirm(croppedFile);
    } finally {
      setSubmitMode("");
    }
  };

  const handleSkip = async () => {
    if (!image?.file) {
      return;
    }

    setSubmitMode(PREVIEW_MODE_ORIGINAL);

    try {
      await onSkip(image.file);
    } finally {
      setSubmitMode("");
    }
  };

  const activePreviewSource =
    previewMode === PREVIEW_MODE_ORIGINAL || !previewUrl
      ? image.url
      : previewUrl;

  return (
    <div className="product-crop-modal fixed inset-0 z-[99999] bg-black/80">
      <div className="product-crop-shell flex min-h-screen w-full items-stretch justify-center sm:items-center sm:p-4 lg:p-6">
        <div className="product-crop-panel flex min-h-screen w-full flex-col overflow-hidden bg-[#18243a] text-[#d0d2d6] sm:min-h-0 sm:max-h-[92vh] sm:max-w-[720px] sm:rounded-[28px] sm:border sm:border-slate-700 sm:shadow-2xl">
          <div className="product-crop-header sticky top-0 z-20 border-b border-slate-700 bg-[#18243a]/95 px-5 py-4 backdrop-blur sm:px-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Product Image Crop
                </p>
                <h2 className="mt-1 text-xl font-semibold text-white sm:text-lg">
                  Adjust the square frame before upload
                </h2>
                <p className="mt-2 text-sm text-slate-400 sm:text-xs">
                  Crop to a square or skip and keep the original image as-is.
                </p>
              </div>

              <button
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-600 bg-[#243554] text-slate-200 transition hover:bg-[#2d4366]"
                onClick={onCancel}
                type="button"
              >
                <FiX size={18} />
              </button>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="min-h-0 border-b border-slate-700 p-5 lg:border-b-0 lg:border-r lg:p-4 sm:px-4 sm:py-4">
              <div
                className="relative mx-auto flex w-full items-center justify-center overflow-hidden rounded-[24px] border border-slate-700"
                style={{
                  aspectRatio: "1 / 1",
                  maxWidth: `min(100%, ${cropAreaSize}px)`,
                  maxHeight: "70vh",
                  backgroundColor,
                }}
              >
                <Cropper
                  aspect={1}
                  crop={crop}
                  cropSize={{
                    width: cropAreaSize,
                    height: cropAreaSize,
                  }}
                  cropShape="rect"
                  image={image.url}
                  minZoom={minZoom}
                  maxZoom={MAX_ZOOM}
                  objectFit="contain"
                  restrictPosition={false}
                  showGrid={false}
                  zoom={zoom}
                  zoomSpeed={0.05}
                  onCropChange={setCrop}
                  onCropComplete={(_, nextCroppedAreaPixels) => {
                    setCroppedAreaPixels(nextCroppedAreaPixels);
                  }}
                  onCropSizeChange={(nextCropSize) => {
                    setCropSize(nextCropSize);
                  }}
                  onMediaLoaded={(nextMediaSize) => {
                    setMediaSize(nextMediaSize);
                    setCrop({ x: 0, y: 0 });
                  }}
                  onZoomChange={(nextZoom) =>
                    setZoom((currentZoom) =>
                      clampValue(nextZoom, minZoom, MAX_ZOOM),
                    )
                  }
                />
              </div>

              <div className="mt-5 rounded-2xl border border-slate-700 bg-[#101a2d] p-4 sm:mt-4 sm:p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-white">Zoom</span>
                  <span className="text-xs font-medium text-slate-400">
                    {zoom.toFixed(2)}x
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3 sm:gap-2">
                  <button
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-600 bg-[#1f2d44] transition hover:bg-[#293b5d]"
                    onClick={() =>
                      setZoom((currentZoom) =>
                        clampValue(currentZoom - 0.1, minZoom, MAX_ZOOM),
                      )
                    }
                    type="button"
                  >
                    <FiMinus />
                  </button>
                  <input
                    aria-label="Zoom image"
                    className="product-crop-range h-11 w-full"
                    max={MAX_ZOOM}
                    min={minZoom}
                    onChange={(event) =>
                      setZoom(clampValue(Number(event.target.value), minZoom, MAX_ZOOM))
                    }
                    step={0.01}
                    type="range"
                    value={zoom}
                  />
                  <button
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-600 bg-[#1f2d44] transition hover:bg-[#293b5d]"
                    onClick={() =>
                      setZoom((currentZoom) =>
                        clampValue(currentZoom + 0.1, minZoom, MAX_ZOOM),
                      )
                    }
                    type="button"
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>
            </div>

            <div className="min-h-0 space-y-4 overflow-y-auto p-5 pb-24 lg:p-4 lg:pb-4 sm:px-4 sm:pt-4">
              <div className="rounded-2xl border border-slate-700 bg-[#101a2d] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">Live Preview</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Preview the square crop or keep the original framing.
                    </p>
                  </div>
                  <div className="inline-flex rounded-xl border border-slate-700 bg-[#162235] p-1">
                    <button
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        previewMode === PREVIEW_MODE_CROPPED
                          ? "bg-[#ff7a1a] text-white"
                          : "text-slate-300 hover:bg-[#22324f]"
                      }`}
                      onClick={() => setPreviewMode(PREVIEW_MODE_CROPPED)}
                      type="button"
                    >
                      Crop
                    </button>
                    <button
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        previewMode === PREVIEW_MODE_ORIGINAL
                          ? "bg-[#ff7a1a] text-white"
                          : "text-slate-300 hover:bg-[#22324f]"
                      }`}
                      onClick={() => setPreviewMode(PREVIEW_MODE_ORIGINAL)}
                      type="button"
                    >
                      Original
                    </button>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-slate-700 bg-[#162235] px-3 py-2 text-xs text-slate-300">
                  {previewMode === PREVIEW_MODE_CROPPED
                    ? "Selected mode: Crop to square"
                    : "Selected mode: Use original image"}
                </div>

                <div className="mt-4">
                  <ProductImage
                    alt={image.name}
                    className="w-full rounded-[22px] border border-slate-700"
                    imgStyle={{ backgroundColor }}
                    src={activePreviewSource}
                    style={{ backgroundColor }}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-[#101a2d] p-4">
                <p className="text-sm font-semibold text-white">Image Details</p>
                <div className="mt-3 space-y-2 text-xs text-slate-400">
                  {details.map((detail) => (
                    <p key={detail}>{detail}</p>
                  ))}
                </div>

                {image.warnings?.length > 0 && (
                  <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-3 text-xs text-amber-200">
                    {image.warnings.map((warning) => (
                      <p key={warning}>{warning}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="product-crop-footer sticky bottom-0 z-20 border-t border-slate-700 bg-[#18243a]/95 px-5 py-4 backdrop-blur sm:px-4">
            <div className="flex gap-3 sm:flex-col">
              <button
                className="flex-1 rounded-xl border border-slate-600 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-[#22324f] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={Boolean(submitMode)}
                onClick={onCancel}
                type="button"
              >
                Cancel
              </button>
              <button
                className="flex-1 rounded-xl border border-slate-500 bg-[#22324f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2b3f61] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={Boolean(submitMode) || !image?.file}
                onClick={handleSkip}
                type="button"
              >
                {submitMode === PREVIEW_MODE_ORIGINAL
                  ? "Saving..."
                  : "Skip & Use Original"}
              </button>
              <button
                className="flex-1 rounded-xl bg-[#ff7a1a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#ea680a] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={Boolean(submitMode) || !croppedAreaPixels}
                onClick={handleSave}
                type="button"
              >
                {submitMode === PREVIEW_MODE_CROPPED ? "Saving..." : "Crop & Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const clampValue = (value, min, max) => Math.min(Math.max(value, min), max);

export default ProductImageCropModal;
