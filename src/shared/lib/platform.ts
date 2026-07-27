function getPlatform(): "desktop" | "android" | "ios" | "unknown" {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "android";
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1))
    return "ios";
  if (/Windows|Mac|Linux/.test(ua) && !/Mobi|Android/i.test(ua)) return "desktop";
  return "unknown";
}

const platform = getPlatform();

export const Platform = {
  isDesktop: platform === "desktop",
  isAndroid: platform === "android",
  isIOS: platform === "ios",
  isMobile: platform === "android" || platform === "ios",
  current: platform,
} as const;
