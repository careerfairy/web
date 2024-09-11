import { CustomJobsPresenter } from "@careerfairy/shared-lib/customJobs/CustomJobsPresenter"
import { CustomJobApplicationSource } from "@careerfairy/shared-lib/customJobs/customJobs"
import { CloseOutlined } from "@mui/icons-material"
import { Box, IconButton } from "@mui/material"
import CustomJobDetailsDialog from "components/views/common/jobs/CustomJobDetailsDialog"
import { fromDate } from "data/firebase/FirebaseInstance"
import { useRouter } from "next/router"
import { ParsedUrlQuery } from "querystring"
import React, { FC, useCallback, useMemo } from "react"

// apps/web/components/views/common/jobs/CustomJobDetailsDialog.tsx
// const CustomJobsDialog = dynamic(() => import("../../../common/jobs/CustomJobDetailsDialog"))

export type CustomJobDialogData = {
   serverSideCustomJob: { [p: string]: any } | null
}

type Props = {
   source: CustomJobApplicationSource
   customJobDialogData?: CustomJobDialogData
   children: React.ReactNode
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
   children,
   source,
}) => {
   const { query, push, pathname } = useRouter()
   const { livestreamDialog } = query
   const [, customJobId] = livestreamDialog || []

   const serverCustomJob = useMemo(() => {
      if (!customJobDialogData?.serverSideCustomJob) return null
      return CustomJobsPresenter.parseDocument(
         customJobDialogData?.serverSideCustomJob as any,
         fromDate
      )
   }, [customJobDialogData?.serverSideCustomJob])

   const dialogOpen = useMemo(() => isCustomJobDialogOpen(query), [query])
   console.log("🚀 ~ dialogOpen:", dialogOpen)

   const handleClose = useCallback(() => {
      void push(
         {
            pathname,
            query: {
               ...query,
               // Remove the jobId path param that opened the dialog.
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
         <CustomJobDetailsDialog
            serverSideCustomJob={serverCustomJob}
            customJobId={customJobId}
            isOpen={dialogOpen}
            onClose={handleClose}
            source={source}
            heroContent={
               <Box display={"flex"} flexDirection={"row-reverse"} p={0} m={0}>
                  <IconButton onClick={handleClose}>
                     <CloseOutlined />
                  </IconButton>
               </Box>
            }
            heroSx={{ m: 0, py: "0px !important", px: "10px !important" }}
         />
      </>
   )
}

export const isCustomJobDialogOpen = (query: ParsedUrlQuery) => {
   const { livestreamDialog } = query
   const [pathType, customJobId] = livestreamDialog || []

   return Boolean(pathType === "jobs" && customJobId)
}
