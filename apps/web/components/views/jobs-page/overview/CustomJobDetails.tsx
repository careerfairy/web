import { Box } from "@mui/material"

import useIsMobile from "components/custom-hook/useIsMobile"
import CustomJobDetailsDialog, {
   InlineCustomJobDetailsContent,
} from "components/views/common/jobs/CustomJobDetailsDialog"
import { CustomJobNotFoundDialog } from "components/views/common/jobs/CustomJobNotFound"
import { useState } from "react"
import { sxStyles } from "types/commonTypes"
import { useJobsOverviewContext } from "../JobsOverviewContext"

const styles = sxStyles({
   root: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      background: (theme) => theme.brand.white[50],
      borderRadius: "8px 8px 0px 0px",
      borderTop: (theme) => `1px solid ${theme.palette.neutral[50]}`,
      borderLeft: (theme) => `1px solid ${theme.palette.neutral[50]}`,
      borderRight: (theme) => `1px solid ${theme.palette.neutral[50]}`,
      overflow: "hidden",
   },
   notFoundRoot: {
      width: "100%",
      p: 2,
      background: (theme) => theme.brand.white[50],
      borderRadius: "8px",
      border: (theme) => `1px solid ${theme.palette.neutral[50]}`,
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "center",
   },
   notFoundWrapper: {
      width: "100%",
      borderRadius: "12px",
      border: (theme) => `1px solid ${theme.brand.white[500]}`,
      background: (theme) => theme.brand.white[100],
      height: "400px",
      p: "24px",
      alignItems: "center",
      justifyContent: "center",
   },
   emptyPlaceholder: {
      "& svg": {
         width: "195px",
         height: "128px",
      },
   },
   mobileNotFoundWrapper: {
      px: "12px",
      height: "85dvh",
   },
})

export const CustomJobDetails = () => {
   const isMobile = useIsMobile()
   const {
      selectedJob,
      context,
      jobDetailsDialogOpen,
      jobNotFound,
      setSelectedJob,
      setJobDetailsDialogOpen,
   } = useJobsOverviewContext()

   const [isNotFoundDialogOpen, setIsNotFoundDialogOpen] = useState(jobNotFound)

   return (
      <Box sx={styles.root}>
         <CustomJobNotFoundDialog
            isOpen={Boolean(isNotFoundDialogOpen && isMobile)}
            handleNotFoundClose={() => setIsNotFoundDialogOpen(false)}
         />
         <CustomJobDetailsDialog
            isOpen={jobDetailsDialogOpen}
            onClose={() => {
               setSelectedJob(undefined)
               setJobDetailsDialogOpen(false)
            }}
            customJobId={selectedJob?.id}
            source={context}
            serverSideCustomJob={selectedJob}
            suspense={false}
         />
         {!isMobile ? (
            <InlineCustomJobDetailsContent
               customJob={selectedJob}
               source={context}
               key={selectedJob?.id}
            />
         ) : null}
      </Box>
   )
}
