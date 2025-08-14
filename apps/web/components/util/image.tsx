import { createRoot } from "react-dom/client"
import QRCode from "react-qr-code"

export type PngExportOptions = {
   /** Exported PNG width/height in pixels. Defaults to 512. */
   size?: number
   /** Background color for the canvas. If omitted, background is transparent. */
   backgroundColor?: string | null
}

/**
 * Convert an SVG element to a PNG data URL.
 *
 * @param svgElement The SVGSVGElement to convert
 * @param options Optional PNG export options
 * @returns Promise resolving to a PNG data URL (data:image/png;base64,...)
 */
export const svgElementToPngDataUrl = async (
   svgElement: SVGSVGElement,
   options: PngExportOptions = {}
): Promise<string> => {
   const { size = 512, backgroundColor = null } = options

   // Serialize the SVG
   const serializer = new XMLSerializer()
   const svgString = serializer.serializeToString(svgElement)
   return svgStringToPngDataUrl(svgString, { size, backgroundColor })
}

/**
 * Convert an SVG markup string to a PNG data URL.
 *
 * @param svgString Serialized SVG markup
 * @param options Optional PNG export options
 * @returns Promise resolving to a PNG data URL (data:image/png;base64,...)
 */
const svgStringToPngDataUrl = async (
   svgString: string,
   options: PngExportOptions = {}
): Promise<string> => {
   const { size = 512, backgroundColor = null } = options

   const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
   })
   const objectUrl = URL.createObjectURL(svgBlob)

   try {
      const image = await loadImage(objectUrl)
      const canvas = document.createElement("canvas")
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("2D context unavailable")

      // Optional background fill (transparent by default)
      if (backgroundColor) {
         ctx.fillStyle = backgroundColor
         ctx.fillRect(0, 0, size, size)
      }
      ctx.drawImage(image, 0, 0, size, size)

      return canvas.toDataURL("image/png")
   } finally {
      URL.revokeObjectURL(objectUrl)
   }
}

/**
 * Trigger a download for a data URL by programmatically clicking an anchor element.
 *
 * @param fileName The file name to use for the download
 * @param dataUrl The data URL to download
 */
export const downloadDataUrl = (fileName: string, dataUrl: string) => {
   const link = document.createElement("a")
   link.href = dataUrl
   link.download = fileName
   document.body.appendChild(link)
   link.click()
   link.remove()
}

/**
 * Helper that loads an image from a URL and resolves once ready.
 */
const loadImage = (src: string): Promise<HTMLImageElement> =>
   new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = (e) => reject(e)
      img.src = src
   })

/**
 * Generate a QR code off-DOM (SVG via react-qr-code), convert to PNG, and trigger a download.
 */
export const generateAndDownloadQr = async (args: {
   value: string
   size?: number
   backgroundColor?: string | null
   fileName?: string
}) => {
   const {
      value,
      size = 512,
      backgroundColor = null,
      fileName = "livestream-qr.png",
   } = args
   const container = document.createElement("div")
   container.style.position = "fixed"
   container.style.left = "-9999px"
   container.style.top = "-9999px"
   document.body.appendChild(container)
   let root: ReturnType<typeof createRoot> | null = null
   try {
      root = createRoot(container)
      root.render(<QRCode value={value} size={size} />)
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
      const svgEl = container.querySelector("svg") as SVGSVGElement | null
      if (!svgEl) return
      const dataUrl = await svgElementToPngDataUrl(svgEl, {
         size,
         backgroundColor,
      })
      downloadDataUrl(fileName, dataUrl)
   } finally {
      if (root) {
         try {
            root.unmount()
         } catch (e) {
            console.error(e)
         }
      }
      container.remove()
   }
}
