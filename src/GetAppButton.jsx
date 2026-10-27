import { Capacitor } from "@capacitor/core";

export default function GetAppButton() {
  // Native Android app ke andar button hide rahega
  if (Capacitor.isNativePlatform()) {
    return null;
  }

  // Normal browser website par button visible rahega
  return (
    <a
      href="/avenzo.apk"
      download="Avenzo.apk"
      className="rounded-lg bg-amber-400 px-5 py-2 text-sm font-semibold text-black hover:bg-amber-300"
    >
      Download App
    </a>
  );
}
