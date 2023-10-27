import React, { FC, useCallback, useMemo } from "react"
import { useRouter } from "next/router"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { fromDate } from "../../../data/firebase/FirebaseInstance"
import SEO from "../../util/SEO"
import { getStreamMetaInfo } from "../../../util/SeoUtil"
import EventSEOSchemaScriptTag from "../common/EventSEOSchemaScriptTag"
import dynamic from "next/dynamic"
import { UserStats } from "@careerfairy/shared-lib/users"
import { useAuth } from "../../../HOCs/AuthProvider"
import { ParsedUrlQuery } from "querystring"

const LivestreamDialog = dynamic(() => import("./LivestreamDialog"))

export type LiveStreamDialogData = {
   serverSideLivestream: { [p: string]: any } | null
   serverSideUserStats: UserStats | null
   serverSideUserEmail: string
}

type Props = {
   livestreamDialogData?: LiveStreamDialogData
   children: React.ReactNode
}

const validDialogPages = ["details", "register", "job-details"] as const
type DialogPage = (typeof validDialogPages)[number]

/**
 * Renders the layout for the dialog that shows livestream information.
 * It requires a serverSideLivestream prop that is used to populate the dialog.
 * If none is provided, the dialog will not be rendered.
 *
 * @param {Props} props - The component's expected properties.
 * @param {ReactNode} props.children - The children to render.
 * @param {Props["livestreamDialogData"]} props.livestreamDialogData - The data to populate the dialog with.
 */
export const LivestreamDialogLayout: FC<Props> = ({
   livestreamDialogData,
   children,
}) => {
   const { userStats } = useAuth()
   const { query, push, pathname } = useRouter()
   const { livestreamDialog } = query

   const [pathType, livestreamId, dialogPage] = livestreamDialog || []

   const updatedStats = useMemo(() => {
      return userStats ? userStats : livestreamDialogData?.serverSideUserStats
   }, [livestreamDialogData?.serverSideUserStats, userStats])

   const serverLivestream = useMemo(() => {
      if (!livestreamDialogData?.serverSideLivestream) return null
      return LivestreamPresenter.parseDocument(
         livestreamDialogData?.serverSideLivestream as any,
         fromDate
      )
   }, [livestreamDialogData?.serverSideLivestream])

   const dialogOpen = useMemo(() => isLivestreamDialogOpen(query), [query])

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
         <LivestreamDialog
            open={dialogOpen}
            updatedStats={updatedStats}
            serverUserEmail={livestreamDialogData?.serverSideUserEmail}
            serverSideLivestream={serverLivestream}
            livestreamId={livestreamId}
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
   )
}

export const isLivestreamDialogOpen = (query: ParsedUrlQuery) => {
   const { livestreamDialog } = query
   const [pathType, livestreamId] = livestreamDialog || []

   return Boolean(pathType === "livestream" && livestreamId)
}
