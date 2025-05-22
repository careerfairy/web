import { useRouter } from "next/router"
import { useEffect, useState } from "react"

type UseOriginSourceProps = {
   /**
    * The mode of operation for the dialog. Can be either "page" or "stand-alone".
    * In "page" mode, originSource is extracted from URL query params.
    * In "stand-alone" mode, originSource is provided via prop.
    */
   mode: "page" | "stand-alone"
   /**
    * The origin source to use in stand-alone mode.
    * Required when mode is "stand-alone".
    */
   providedOriginSource?: string | null
}

/**
 * A hook to manage the source of a livestream impression.
 * Handles both page mode (from URL) and stand-alone mode (from props).
 *
 * The originSource is set once at mount and not changed for the lifetime
 * of the dialog, as it tracks the original source that led to opening the dialog.
 *
 * @returns The origin source or null if not available
 */
export const useOriginSource = ({
   mode,
   providedOriginSource,
}: UseOriginSourceProps): string | null => {
   const router = useRouter()

   // Initialize from either the provided source (stand-alone mode) or URL (page mode)
   const [originSource, setOriginSource] = useState<string | null>(
      mode === "stand-alone"
         ? providedOriginSource
         : (router.query.originSource as string)
   )

   // For page mode, update if the query parameter changes
   useEffect(() => {
      if (mode === "page" && router.query.originSource) {
         setOriginSource(router.query.originSource as string)
      }
   }, [mode, router.query.originSource])

   return originSource
}
