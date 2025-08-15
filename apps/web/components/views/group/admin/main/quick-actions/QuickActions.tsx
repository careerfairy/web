import { Box, Button, Stack, Typography } from "@mui/material"
import { useAppDispatch } from "components/custom-hook/store"
import useIsDesktop from "components/custom-hook/useIsDesktop"
import { useHasAccessToSparks } from "components/views/admin/sparks/useHasAccesToSparks"
import { useLivestreamRouting } from "components/views/group/admin/events/useLivestreamRouting"
import { JOB_DIALOG_QUERY_KEYS } from "components/custom-hook/custom-job/useJobDialogRouter"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useRouter } from "next/router"
import { useCallback } from "react"
import { Briefcase, PlayCircle, Radio } from "react-feather"
import { openSparkDialog } from "store/reducers/adminSparksReducer"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   container: {
      display: "flex",
      justifyContent: "center",
      marginBottom: 3,
   },
   quickActionButton: {
      backgroundColor: (theme) => theme.brand.white[100],
      borderColor: "secondary.50", // Use secondary.50 for purple 50
      color: "neutral.800",
      borderRadius: "10px",
      textTransform: "none",
      fontWeight: 500,
      padding: "12px 24px",
      minWidth: "200px",
      border: "1px solid",
      "&:hover": {
         backgroundColor: (theme) => theme.brand.white[200],
         borderColor: "secondary.100", // Use secondary.100 for purple 100
      },
      "&:disabled": {
         backgroundColor: (theme) => theme.brand.white[100],
         borderColor: "secondary.50", // Use secondary.50 for purple 50
         color: "neutral.500",
         opacity: 0.7,
      },
   },
})

export const QuickActions = () => {
   const isDesktop = useIsDesktop()
   const { createDraftLivestream, isCreating } = useLivestreamRouting()
   const { push, query } = useRouter()
   const hasAccessToSparks = useHasAccessToSparks()
   const { group } = useGroup()
   const dispatch = useAppDispatch()

   const groupId = query.groupId as string

   const handleJobCreation = useCallback(() => {
      push(`/group/${groupId}/admin/jobs?${JOB_DIALOG_QUERY_KEYS.jobDialog}=true`)
   }, [push, groupId])

   const handleLiveStreamCreation = useCallback(() => {
      if (isCreating) return
      createDraftLivestream()
   }, [createDraftLivestream, isCreating])

   const handleSparkUpload = useCallback(() => {
      if (hasAccessToSparks) {
         dispatch(openSparkDialog())
      } else {
         push(`/group/${groupId}/admin/content/sparks`)
      }
   }, [hasAccessToSparks, dispatch, push, groupId])

   // Only show on desktop
   if (!isDesktop) {
      return null
   }

   return (
      <Box sx={styles.container}>
         <Stack direction="row" spacing={2}>
            <Button
               sx={styles.quickActionButton}
               startIcon={<Briefcase size={24} />}
               onClick={handleJobCreation}
            >
               <Typography variant="brandedBody">
                  Publish a job opening
               </Typography>
            </Button>
            
            <Button
               sx={styles.quickActionButton}
               startIcon={<Radio size={24} />}
               onClick={handleLiveStreamCreation}
               disabled={isCreating}
            >
               <Typography variant="brandedBody">
                  Create a live stream
               </Typography>
            </Button>
            
            <Button
               sx={styles.quickActionButton}
               startIcon={<PlayCircle size={24} />}
               onClick={handleSparkUpload}
            >
               <Typography variant="brandedBody">
                  Upload a Spark
               </Typography>
            </Button>
         </Stack>
      </Box>
   )
}