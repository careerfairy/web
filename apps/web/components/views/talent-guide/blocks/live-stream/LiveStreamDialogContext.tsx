import { useRouter } from "next/router"
import {
   createContext,
   ReactNode,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react"
import { LiveStreamDialogExtended } from "./LiveStreamDialogExtended"
import { useIsLiveStreamDialogOpen } from "./useIsLiveStreamDialogOpen"

export type LiveStreamDialogContextType = {
   handleLiveStreamDialogOpen: (liveStreamId: string) => void
   handleLiveStreamDialogClose: () => void
   currentLiveStreamIdInDialog: string
   setCurrentLiveStreamIdInDialog: (liveStreamId: string) => void
   getLiveStreamDialogKey: () => string
   isLiveStreamDialogOpen: boolean
}

const LiveStreamDialogContext = createContext<
   LiveStreamDialogContextType | undefined
>(undefined)

type LiveStreamDialogProviderProps = {
   children: ReactNode
}

export const LiveStreamDialogProvider = ({
   children,
}: LiveStreamDialogProviderProps) => {
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
      (newLiveStreamId: string) => {
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
      setCurrentLiveStreamIdInDialog(undefined)
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

   const contextValue = useMemo(
      () => ({
         isLiveStreamDialogOpen,
         handleLiveStreamDialogOpen,
         handleLiveStreamDialogClose,
         currentLiveStreamIdInDialog,
         setCurrentLiveStreamIdInDialog,
         getLiveStreamDialogKey,
      }),
      [
         isLiveStreamDialogOpen,
         handleLiveStreamDialogOpen,
         handleLiveStreamDialogClose,
         currentLiveStreamIdInDialog,
         setCurrentLiveStreamIdInDialog,
         getLiveStreamDialogKey,
      ]
   )

   return (
      <LiveStreamDialogContext.Provider value={contextValue}>
         {children}
         <LiveStreamDialogExtended
            isLiveStreamDialogOpen={isLiveStreamDialogOpen}
            currentLiveStreamIdInDialog={currentLiveStreamIdInDialog}
            handleLiveStreamDialogClose={handleLiveStreamDialogClose}
            getLiveStreamDialogKey={getLiveStreamDialogKey}
         />
      </LiveStreamDialogContext.Provider>
   )
}

export const useLiveStreamDialog = () => {
   return useContext(LiveStreamDialogContext)
}
