/**
 * Image Optimization Utilities for Cloudinary & Fast Image Delivery
 * 
 * Automatically applies Cloudinary transformations (f_auto, q_auto, c_limit, w_N)
 * to convert any raw uploaded PNG/JPEG into ultra-compressed WebP/AVIF format.
 * Reduces payload size by up to 90% (e.g. 3MB -> 30KB).
 */

export function optimizeCloudinaryUrl(url: string, width = 600): string {
  if (!url || typeof url !== "string") return "/images/new_waffle-bgless.png";

  // Only transform Cloudinary delivery URLs
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    // If transformation parameters are not already present
    if (!url.includes("f_auto") && !url.includes("c_limit")) {
      return url.replace("/upload/", `/upload/c_limit,w_${width},f_auto,q_auto/`);
    }
  }

  return url;
}
