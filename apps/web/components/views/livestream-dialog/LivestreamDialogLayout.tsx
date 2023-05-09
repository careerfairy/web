import React, {
   createContext,
   FC,
   useCallback,
   useContext,
   useMemo,
} from "react"
import { useRouter } from "next/router"
import LivestreamDialog from "./LivestreamDialog"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { fromDate } from "../../../data/firebase/FirebaseInstance"
import SEO from "../../util/SEO"
import { getStreamMetaInfo } from "../../../util/SeoUtil"
import EventSEOSchemaScriptTag from "../common/EventSEOSchemaScriptTag"

type Props = {
   serverSideLivestream: { [p: string]: any } | null
}

export const LivestreamDialogLayout: FC<Props> = ({
   children,
   serverSideLivestream,
}) => {
   const router = useRouter()
   const livestreamParams = router.query.livestream

   const dialogLivestream = useMemo(() => {
      if (!serverSideLivestream) return null
      return LivestreamPresenter.parseDocument(
         serverSideLivestream as any,
         fromDate
      )
   }, [serverSideLivestream])

   const dialogOpen = useMemo(() => {
      return (
         livestreamParams?.[0] === "livestream" &&
         dialogLivestream &&
         livestreamParams?.[1] === dialogLivestream?.id
      )
   }, [livestreamParams, dialogLivestream])

   const handleClose = useCallback(() => {
      const basePath = router.asPath.split("/livestream")[0]
      void router.push(basePath)
   }, [router])

   const contextValue = useMemo<ILivestreamDialogLayoutContext>(
      () => ({
         handleClose,
      }),
      [handleClose]
   )

   return (
      <LayoutContext.Provider value={contextValue}>
         {children}
         {dialogOpen ? (
            <>
               <LivestreamDialog
                  open={dialogOpen}
                  serverSideLivestream={dialogLivestream}
                  handleClose={handleClose}
               />
               <SEO {...getStreamMetaInfo(dialogLivestream)} />
               <EventSEOSchemaScriptTag event={dialogLivestream} />
            </>
         ) : null}
      </LayoutContext.Provider>
   )
}

type ILivestreamDialogLayoutContext = {
   handleClose: () => void
}

export const useLivestreamDialogLayout = () => {
   const context = useContext(LayoutContext)
   if (!context) {
      throw new Error(
         "useLivestreamDialogLayout must be used within a LivestreamDialogLayoutProvider"
      )
   }
   return context
}

const LayoutContext = createContext<ILivestreamDialogLayoutContext>({
   handleClose: () => {},
})
