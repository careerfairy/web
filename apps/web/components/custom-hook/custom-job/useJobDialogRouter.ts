/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRouter } from "next/router"
import { useCallback, useMemo } from "react"

export const JOB_DIALOG_QUERY_KEYS = {
   jobDialog: "jobDialog",
   deleteJobDialog: "deleteJobDialog",
   selectedJobId: "selectedJobId",
} as const

/**
 * Hook for managing job dialog and delete job dialog state via Next.js router query params.
 * Provides helpers to open/close dialogs and access selected job id.
 */
export const useJobDialogRouter = () => {
   const { query, pathname, push } = useRouter()

   const isJobDialogOpen = useMemo(
      () => query[JOB_DIALOG_QUERY_KEYS.jobDialog] === "true",
      [query]
   )

   const isDeleteJobDialogOpen = useMemo(
      () => query[JOB_DIALOG_QUERY_KEYS.deleteJobDialog] === "true",
      [query]
   )

   const selectedJobId = useMemo(
      () => query[JOB_DIALOG_QUERY_KEYS.selectedJobId] as string,
      [query]
   )

   const openJobDialog = useCallback(
      (jobId?: string) => {
         const { [JOB_DIALOG_QUERY_KEYS.selectedJobId]: _, ...restQuery } =
            query

         push({
            pathname,
            query: {
               ...restQuery,
               [JOB_DIALOG_QUERY_KEYS.jobDialog]: "true",
               ...(jobId && { [JOB_DIALOG_QUERY_KEYS.selectedJobId]: jobId }),
            },
         })
      },
      [push, pathname, query]
   )

   const openDeleteJobDialog = useCallback(
      (selectedJobId: string) => {
         push({
            pathname,
            query: {
               ...query,
               [JOB_DIALOG_QUERY_KEYS.deleteJobDialog]: "true",
               [JOB_DIALOG_QUERY_KEYS.selectedJobId]: selectedJobId,
            },
         })
      },
      [push, pathname, query]
   )

   const closeJobDialog = useCallback(() => {
      const {
         [JOB_DIALOG_QUERY_KEYS.jobDialog]: _jobDialog,
         [JOB_DIALOG_QUERY_KEYS.deleteJobDialog]: _deleteJobDialog,
         [JOB_DIALOG_QUERY_KEYS.selectedJobId]: _selectedJobId,
         ...restQuery
      } = query

      push({
         pathname,
         query: restQuery,
      })
   }, [push, pathname, query])

   return {
      isJobDialogOpen,
      isDeleteJobDialogOpen,
      selectedJobId,
      openJobDialog,
      openDeleteJobDialog,
      closeJobDialog,
   }
}
