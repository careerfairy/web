import { Box, Stack, Typography } from "@mui/material"

import useIsMobile from "components/custom-hook/useIsMobile"
import { ResponsiveDialogLayout } from "components/views/common/ResponsiveDialog"
import { EmptyPlaceholder } from "components/views/common/icons/EmptyPlaceholder"
import CustomJobDetailsDialog, {
   InlineCustomJobDetailsContent,
} from "components/views/common/jobs/CustomJobDetailsDialog"
import { useRouter } from "next/router"
import { useCallback, useState } from "react"
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
      setJobDetailsDialogOpen,
   } = useJobsOverviewContext()

   const router = useRouter()
   // TODO: Remove, this is for easier testing
   const notFound = !selectedJob || router.query.notFound === "true"
   const [isOpen, setIsOpen] = useState(notFound)

   const handleNotFoundClose = useCallback(() => {
      setIsOpen(false)

      const query = router.query
      delete query.jobId
      delete query.notFound

      router.push(
         {
            pathname: router.pathname,
            query: query,
         },
         undefined,
         { shallow: true }
      )
      setJobDetailsDialogOpen(false)
   }, [setIsOpen, router, setJobDetailsDialogOpen])

   if (notFound) {
      return (
         <NotFoundWrapper
            isMobile={isMobile}
            isOpen={isOpen}
            handleNotFoundClose={handleNotFoundClose}
         />
      )
   }

   return (
      <Box sx={styles.root}>
         {isMobile ? (
            <CustomJobDetailsDialog
               isOpen={jobDetailsDialogOpen}
               onClose={() => setJobDetailsDialogOpen(false)}
               customJobId={selectedJob.id}
               source={context}
               serverSideCustomJob={selectedJob}
               suspense={false}
            />
         ) : (
            <InlineCustomJobDetailsContent
               customJob={selectedJob}
               source={context}
            />
         )}
      </Box>
   )
}

type NotFoundWrapperProps = {
   isMobile: boolean
   isOpen: boolean
   handleNotFoundClose: () => void
}

const NotFoundWrapper = ({
   isMobile,
   isOpen,
   handleNotFoundClose,
}: NotFoundWrapperProps) => {
   if (isMobile) {
      return (
         <ResponsiveDialogLayout
            open={isOpen}
            handleClose={handleNotFoundClose}
         >
            <Box sx={styles.mobileNotFoundWrapper}>
               <CustomJobNotFound />
            </Box>
         </ResponsiveDialogLayout>
      )
   }

   return (
      <Stack sx={styles.notFoundRoot}>
         <CustomJobNotFound />
      </Stack>
   )
}

const CustomJobNotFound = () => {
   return (
      <Stack spacing={"12px"} sx={styles.notFoundWrapper}>
         <Box sx={styles.emptyPlaceholder}>
            <EmptyPlaceholder />
         </Box>
         <Stack spacing={"4px"}>
            <Typography variant="medium" color={"neutral.800"} fontWeight={600}>
               Oops... This job is no longer available
            </Typography>
            <Typography variant="small" color={"neutral.700"} fontWeight={400}>
               But don&apos;t worry, there are plenty of others to explore.
            </Typography>
         </Stack>
      </Stack>
   )
}
