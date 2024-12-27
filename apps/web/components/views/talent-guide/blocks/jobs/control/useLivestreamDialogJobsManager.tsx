import { useRouter } from "next/router"
import { useCallback, useEffect, useState } from "react"
import { useIsLiveStreamDialogOpen } from "../../../live-stream/useIsLiveStreamDialogOpen"
import { JobsBlockContextType } from "./JobsBlockContext"

export const useLiveStreamDialogJobsManager = (): {
   currentLiveStreamIdInDialog: JobsBlockContextType["currentLiveStreamIdInDialog"]
   setCurrentLiveStreamIdInDialog: JobsBlockContextType["setCurrentLiveStreamIdInDialog"]
   handleLiveStreamDialogOpen: JobsBlockContextType["handleLiveStreamDialogOpen"]
   handleLiveStreamDialogClose: JobsBlockContextType["handleLiveStreamDialogClose"]
   handleCloseCardClick: JobsBlockContextType["handleCloseCardClick"]
   isLiveStreamDialogOpen: JobsBlockContextType["isLiveStreamDialogOpen"]
   getLiveStreamDialogKey: JobsBlockContextType["getLiveStreamDialogKey"]
} => {
   const router = useRouter()
   const isLiveStreamDialogOpen = useIsLiveStreamDialogOpen()

   const [currentLiveStreamIdInDialog, setCurrentLiveStreamIdInDialog] =
      useState<string>(undefined)

   // This is used to force a re-render of the dialog when the live stream id is the same
   // on nested live stream cards. Example: speaker details with same live stream card on
   // linked content section.
   const [liveStreamDialogKey, setLiveStreamDialogKey] =
      useState<string>(undefined)

   const handleLiveStreamDialogOpen = useCallback(
      (jobId: string, newLiveStreamId: string) => {
         if (currentLiveStreamIdInDialog === newLiveStreamId) {
            setLiveStreamDialogKey(
               `${currentLiveStreamIdInDialog}-${Date.now()}`
            )
         } else {
            setLiveStreamDialogKey(undefined)
         }

         void router.push(
            {
               pathname: router.pathname,
               query: {
                  ...router.query,
                  jobId: jobId,
                  dialogLiveStreamId: newLiveStreamId,
               },
            },
            undefined,
            {
               scroll: false,
               shallow: true,
            }
         )
      },
      [currentLiveStreamIdInDialog, router]
   )

   const handleLiveStreamDialogClose = useCallback(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { dialogLiveStreamId, ...restOfQuery } = router.query
      setLiveStreamDialogKey(undefined)
      void router.push(
         {
            pathname: router.pathname,
            query: restOfQuery,
         },
         undefined,
         {
            scroll: false,
            shallow: true,
         }
      )
   }, [router])

   const handleCloseCardClick = useCallback(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { jobId, ...restOfQuery } = router.query
      void router.push(
         {
            pathname: router.pathname,
            query: restOfQuery,
         },
         undefined,
         {
            scroll: false,
            shallow: true,
         }
      )

      setCurrentLiveStreamIdInDialog(undefined)
   }, [router, setCurrentLiveStreamIdInDialog])

   const getLiveStreamDialogKey = useCallback(() => {
      return liveStreamDialogKey || currentLiveStreamIdInDialog
   }, [liveStreamDialogKey, currentLiveStreamIdInDialog])

   useEffect(() => {
      const queryParamLiveStreamId = router.query.dialogLiveStreamId as string

      if (queryParamLiveStreamId) {
         if (liveStreamDialogKey === queryParamLiveStreamId) {
            setLiveStreamDialogKey(`${queryParamLiveStreamId}-${Date.now()}`)
         } else {
            setLiveStreamDialogKey(undefined)
         }
         setCurrentLiveStreamIdInDialog(queryParamLiveStreamId)
      }
   }, [
      router.query.dialogLiveStreamId,
      setCurrentLiveStreamIdInDialog,
      isLiveStreamDialogOpen,
      liveStreamDialogKey,
   ])

   return {
      handleLiveStreamDialogOpen,
      handleLiveStreamDialogClose,
      handleCloseCardClick,
      isLiveStreamDialogOpen,
      currentLiveStreamIdInDialog,
      setCurrentLiveStreamIdInDialog,
      getLiveStreamDialogKey,
   }
}
