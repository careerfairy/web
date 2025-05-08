import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { UserStats } from "@careerfairy/shared-lib/users"
import { useIsMounted } from "components/custom-hook/utils/useIsMounted"
import { useRouter } from "next/router"
import { ParsedUrlQuery } from "querystring"
import { FC, ReactNode, useCallback, useMemo } from "react"
import { fromDate } from "../../../data/firebase/FirebaseInstance"
import { useAuth } from "../../../HOCs/AuthProvider"
import { getStreamMetaInfo } from "../../../util/SeoUtil"
import SEO from "../../util/SEO"
import EventSEOSchemaScriptTag from "../common/EventSEOSchemaScriptTag"
import LivestreamDialog from "./LivestreamDialog"
import { DialogPageType, DialogPageTypeMapping } from "./util"

export type LiveStreamDialogData = {
   serverSideLivestream: { [p: string]: any } | null
   serverSideUserStats: UserStats | null
   serverSideUserEmail: string
}

type Props = {
   livestreamDialogData?: LiveStreamDialogData
   children: ReactNode
}

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
   const isMounted = useIsMounted()
   const { livestreamDialog } = query

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

   const page = useMemo<DialogPageType>(() => {
      return DialogPageTypeMapping[dialogPage] || "details"
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
            initialPage={page}
            appear={isMounted}
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
