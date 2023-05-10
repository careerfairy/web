import React, { FC, useCallback, useMemo } from "react"
import { useRouter } from "next/router"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { fromDate } from "../../../data/firebase/FirebaseInstance"
import SEO from "../../util/SEO"
import { getStreamMetaInfo } from "../../../util/SeoUtil"
import EventSEOSchemaScriptTag from "../common/EventSEOSchemaScriptTag"
import dynamic from "next/dynamic"

const LivestreamDialog = dynamic(() => import("./LivestreamDialog"))

type Props = {
   serverSideLivestream: { [p: string]: any } | null
}

type DialogPage = "details" | "register" | "job-details"
const validDialogPages: DialogPage[] = ["details", "register", "job-details"]

/**
 * Renders the layout for the dialog that shows livestream information.
 * It requires a serverSideLivestream prop that is used to populate the dialog.
 * If none is provided, the dialog will not be rendered.
 *
 * @param {Props} props - The component's expected properties.
 * @param {ReactNode} props.children - The children to render.
 * @param {LivestreamEvent} props.serverSideLivestream - The livestream to show in the dialog.
 */
export const LivestreamDialogLayout: FC<Props> = ({
   children,
   serverSideLivestream,
}) => {
   const { query, push, pathname } = useRouter()
   const { livestreamDialog } = query

   const [pathType, livestreamId, dialogPage, jobId] = livestreamDialog || []

   const serverLivestream = useMemo(() => {
      if (!serverSideLivestream) return null
      return LivestreamPresenter.parseDocument(
         serverSideLivestream as any,
         fromDate
      )
   }, [serverSideLivestream])

   const dialogOpen = useMemo(
      () => Boolean(pathType === "livestream" && livestreamId),
      [pathType, livestreamId]
   )

   const page = useMemo<DialogPage>(() => {
      if (validDialogPages.includes(dialogPage as DialogPage)) {
         return dialogPage as DialogPage
      }
      return "details" // Fallback to details page.
   }, [dialogPage])

   const handleClose = useCallback(() => {
      void push(
         {
            pathname,
            query: {
               ...query,
               // Remove the livestream query param that opened the dialog.
               livestreamDialog: undefined,
            },
         },
         undefined,
         {
            scroll: false, // Prevent scrolling to top.
            shallow: true, // Prevents GSSP/GSP/GIP from running again. https://nextjs.org/docs/pages/building-your-application/routing/linking-and-navigating#shallow-routing
         }
      )
   }, [pathname, push, query])

   return (
      <>
         {children}
         {dialogOpen ? (
            <>
               <LivestreamDialog
                  open={dialogOpen}
                  serverSideLivestream={serverLivestream}
                  livestreamId={livestreamId}
                  jobId={jobId}
                  handleClose={handleClose}
                  page={page}
               />
               {/* Set SEO tags for the page. */}
               {serverLivestream ? (
                  <SEO {...getStreamMetaInfo(serverLivestream)} />
               ) : null}

               {/* Set schema tags for the event shown in the dialog. */}
               {serverLivestream ? (
                  <EventSEOSchemaScriptTag event={serverLivestream} />
               ) : null}
            </>
         ) : null}
      </>
   )
}
