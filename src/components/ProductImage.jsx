import React, { useEffect, useState } from "react";

const DEFAULT_PRODUCT_FALLBACK = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <rect width="400" height="400" fill="#f5f5f5"/>
    <rect x="80" y="90" width="240" height="220" rx="24" fill="#ffffff" stroke="#d6d6d6" stroke-width="12"/>
    <path d="M120 250l50-55c9-10 24-11 34-1l25 24 34-39c10-11 27-12 38-1l49 49" fill="none" stroke="#c5c5c5" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="166" cy="156" r="22" fill="#d8d8d8"/>
    <text x="200" y="348" fill="#9c9c9c" font-family="Arial, sans-serif" font-size="28" text-anchor="middle">No Image</text>
  </svg>`,
)}`;

const ProductImage = ({
  src,
  alt,
  aspectRatio = "1 / 1",
  className = "",
  imgClassName = "",
  backgroundClassName = "bg-[var(--product-image-bg)]",
  fallbackSrc = DEFAULT_PRODUCT_FALLBACK,
  loading = "lazy",
  draggable = false,
  style,
  imgStyle,
  onError,
  ...rest
}) => {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  const handleError = (event) => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }

    if (typeof onError === "function") {
      onError(event);
    }
  };

  const wrapperStyle = aspectRatio ? { aspectRatio, ...style } : style;

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${backgroundClassName} ${className}`.trim()}
      style={wrapperStyle}
    >
      <img
        {...rest}
        alt={alt || "Product image"}
        className={`h-full w-full object-contain object-center ${imgClassName}`.trim()}
        decoding="async"
        draggable={draggable}
        loading={loading}
        onError={handleError}
        src={currentSrc || fallbackSrc}
        style={imgStyle}
      />
    </div>
  );
};

export default ProductImage;
