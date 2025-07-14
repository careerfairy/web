import { useRouter } from "next/router"
import { useCallback, useMemo } from "react"
import { useHasAccessToSparks } from "../../useHasAccesToSparks"

export const SPARKS_DIALOG_QUERY_KEYS = {
   sparksDialog: "sparksDialog",
} as const

/**
 * Hook for managing the open/close state of the Sparks dialog via Next.js router query params.
 * Provides isOpen, openDialog, and closeDialog helpers.
 */
export const useSparksDialogRouter = () => {
   const { query, push, pathname } = useRouter()
   const hasAccessToSparks = useHasAccessToSparks()

   const isOpen = useMemo(() => {
      if (!hasAccessToSparks) return false

      return query[SPARKS_DIALOG_QUERY_KEYS.sparksDialog] === "true"
   }, [hasAccessToSparks, query])

   const openDialog = useCallback(() => {
      push(
         {
            pathname: "/group/[groupId]/admin/content/sparks",
            query: {
               ...query,
               [SPARKS_DIALOG_QUERY_KEYS.sparksDialog]: "true",
            },
         },
         undefined,
         { shallow: true }
      )
   }, [push, query])

   const closeDialog = useCallback(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [SPARKS_DIALOG_QUERY_KEYS.sparksDialog]: _, ...restQuery } = query

      push(
         {
            pathname,
            query: restQuery,
         },
         undefined,
         { shallow: true }
      )
   }, [pathname, push, query])

   return {
      isOpen,
      openDialog,
      closeDialog,
   }
}
