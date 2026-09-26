import QRCode from "qrcode";

/** Renders a QR code for `text` as a PNG data URL. */
export async function generateQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    width: 180,
    margin: 1,
    color: { dark: "#0b0b0b", light: "#00000000" },
  });
}
