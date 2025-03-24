import { CustomJobsPresenter } from "@careerfairy/shared-lib/customJobs/CustomJobsPresenter"
import {
   CustomJobApplicationSource,
   CustomJobApplicationSourceTypes,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import useIsMobile from "components/custom-hook/useIsMobile"
import CustomJobDetailsDialog from "components/views/common/jobs/CustomJobDetailsDialog"
import { fromDate } from "data/firebase/FirebaseInstance"
import { useRouter } from "next/router"
import { ParsedUrlQuery } from "querystring"
import React, { FC, useCallback, useMemo } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   profilePaperProps: {
      position: "fixed", // Fix the dialog at the bottom of the screen
      bottom: 0, // Align it to the bottom
      left: 0, // Ensure it starts from the left side of the screen
      right: 0, // Ensure it spans the entire width
      margin: "0", // Remove any external margin
      width: "100%", // Full width on mobile
      maxHeight: "85vh", // Allow content to dictate the height
      height: "auto", // Dynamically adjust the height based on content
      borderRadius: "12px 12px 0 0", // Optional rounded corners at the top
   },
   heroSx: {
      m: 0,
      py: "0px !important",
      pt: {
         xs: "5px !important",
         md: "24px !important",
      },
      px: "10px !important",
   },
})

export type CustomJobDialogData = {
   serverSideCustomJob: { [p: string]: any } | null
}

type Props = {
   source: CustomJobApplicationSource
   dialogSource?: string
   customJobDialogData?: CustomJobDialogData
   children: React.ReactNode
   hideApplicationConfirmation?: boolean
}

/**
 * Renders the layout for the dialog that shows custom job information.
 * It requires a serverSideCustomJob prop that is used to populate the dialog.
 * If none is provided, the dialog will not be rendered.
 *
 * @param {Props} props - The component's expected properties.
 * @param {ReactNode} props.children - The children to render.
 * @param {Props["customJobDialogData"]} props.customJobDialogData - The data to populate the dialog with.
 */
export const CustomJobDialogLayout: FC<Props> = ({
   customJobDialogData,
   dialogSource = "jobsDialog",
   children,
   source,
   hideApplicationConfirmation,
}) => {
   const isMobile = useIsMobile()
   const { query, push, pathname } = useRouter()
   const dialog = query[dialogSource]
   const [, customJobId] = dialog || []

   const serverCustomJob = useMemo(() => {
      if (!customJobDialogData?.serverSideCustomJob) return null
      return CustomJobsPresenter.parseDocument(
         customJobDialogData?.serverSideCustomJob as any,
         fromDate
      )
   }, [customJobDialogData?.serverSideCustomJob])

   const dialogOpen = useMemo(
      () => isCustomJobDialogOpen(query, dialogSource),
      [query, dialogSource]
   )

   const handleClose = useCallback(() => {
      // Remove the jobId path param that opened the dialog.
      delete query[dialogSource]

      void push(
         {
            pathname,
            query,
         },
         undefined,
         {
            scroll: false, // Prevent scrolling to top.
            shallow: true, // Prevents GSSP/GSP/GIP from running again. https://nextjs.org/docs/pages/building-your-application/routing/linking-and-navigating#shallow-routing
         }
      )
   }, [pathname, push, query, dialogSource])

   const hasPaperProps = Boolean(
      (source.source == CustomJobApplicationSourceTypes.Profile ||
         source.source == CustomJobApplicationSourceTypes.Portal) &&
         isMobile
   )

   return (
      <>
         {children}
         <CustomJobDetailsDialog
            serverSideCustomJob={serverCustomJob}
            customJobId={customJobId}
            isOpen={dialogOpen}
            onClose={handleClose}
            source={source}
            heroSx={styles.heroSx}
            paperPropsSx={hasPaperProps ? styles.profilePaperProps : null}
            hideApplicationConfirmation={hideApplicationConfirmation}
         />
      </>
   )
}

export const isCustomJobDialogOpen = (
   query: ParsedUrlQuery,
   dialogSource: string
) => {
   const dialog = query[dialogSource]
   const [pathType, customJobId] = dialog || []

   return Boolean(pathType === "jobs" && customJobId)
}
