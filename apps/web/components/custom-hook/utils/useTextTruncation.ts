import {
   TruncationResult,
   calculateOptimalTruncation,
   getCanvasContext,
} from "@careerfairy/shared-lib/utils/utils"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useMeasure } from "react-use"

/**
 * @description
 * A custom hook that truncates text to fit within a container, using the canvas context to measure the text width.
 * The hook uses the useMeasure hook and calculateOptimalTruncation function to calculate the optimal truncation.
 * Items which are truncated are counted, which can be used to display a "+" count or other scenarios.
 * @param items - The items to truncate.
 * @param separator - The separator to use between items.
 * @returns A tuple containing the ref, the truncation result, and the font style.
 */
export const useTextTruncation = (
   items: string[],
   separator: string = ", "
): [(node: HTMLElement | null) => void, TruncationResult, string] => {
   const [element, setElement] = useState<HTMLElement | null>(null)
   const [fontStyle, setFontStyle] = useState<string>("14px sans-serif")
   const [measureRef, { width }] = useMeasure<HTMLElement>()

   const ref = useCallback(
      (node: HTMLElement | null) => {
         setElement(node)
         measureRef(node)
      },
      [measureRef]
   )

   useEffect(() => {
      if (element) {
         const computedStyle = window.getComputedStyle(element)
         const newFontDescription = [
            computedStyle.getPropertyValue("font-style"),
            computedStyle.getPropertyValue("font-variant"),
            computedStyle.getPropertyValue("font-weight"),
            computedStyle.getPropertyValue("font-size"),
            computedStyle.getPropertyValue("font-family"),
         ]
            .join(" ")
            .trim()

         if (
            newFontDescription &&
            newFontDescription.includes("px") &&
            newFontDescription !== fontStyle
         ) {
            setFontStyle(newFontDescription)
         } else if (
            (!newFontDescription || !newFontDescription.includes("px")) &&
            fontStyle !== "14px sans-serif"
         ) {
            setFontStyle("14px sans-serif")
         }
      }
   }, [element, width, fontStyle])

   const result = useMemo(() => {
      if (!element || !width || !items || items.length === 0) {
         const joinedItems = items?.join(separator) || ""
         return {
            truncatedText: joinedItems.trimEnd(),
            plusCount: null,
            shouldShowTooltip: false,
         }
      }

      const ctx = getCanvasContext()
      if (ctx) {
         ctx.font = fontStyle
      }
      return calculateOptimalTruncation(ctx, items, width, separator)
   }, [items, width, separator, element, fontStyle])

   return [ref, result, fontStyle]
}
