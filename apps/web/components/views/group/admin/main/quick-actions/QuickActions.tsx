import { Box, Button, Stack, Typography } from "@mui/material"
import { JOB_DIALOG_QUERY_KEYS } from "components/custom-hook/custom-job/useJobDialogRouter"
import { useAppDispatch } from "components/custom-hook/store"
import useIsDesktop from "components/custom-hook/useIsDesktop"
import { useHasAccessToSparks } from "components/views/admin/sparks/useHasAccesToSparks"
import { useLivestreamRouting } from "components/views/group/admin/events/useLivestreamRouting"
import { useOfflineEventRouting } from "components/views/group/admin/offline-events/useOfflineEventRouting"
import { useRouter } from "next/router"
import { useCallback } from "react"
import { Briefcase, Calendar, PlayCircle, Radio } from "react-feather"
import { openSparkDialog } from "store/reducers/adminSparksReducer"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   container: {
      display: "flex",
      justifyContent: "center",
      marginBottom: 2,
      width: "100%",
   },
   buttonsStack: {
      width: "100%",
   },
   quickActionButton: {
      backgroundColor: (theme) => theme.brand.white[100],
      borderColor: "secondary.50",
      borderWidth: "1px",
      borderStyle: "solid",
      color: "neutral.800",
      borderRadius: "10px",
      textTransform: "none",
      fontWeight: 400,
      padding: "15px 24px",
      flex: 1,
      height: "56px",
      "&:hover": {
         backgroundColor: (theme) => theme.brand.white[300],
         borderColor: "secondary.300",
         borderWidth: "1px",
         borderStyle: "solid",
         color: "neutral.800",
      },
      "&:disabled": {
         backgroundColor: (theme) => theme.brand.white[100],
         borderColor: "secondary.50",
         borderWidth: "1px",
         borderStyle: "solid",
         color: "neutral.500",
         opacity: 0.7,
      },
   },
})

export const QuickActions = () => {
   const isDesktop = useIsDesktop()
   const { createDraftLivestream, isCreating } = useLivestreamRouting()
   const { createDraftOfflineEvent, isCreating: isCreatingOfflineEvent } =
      useOfflineEventRouting()
   const { push, query } = useRouter()
   const hasAccessToSparks = useHasAccessToSparks()
   const dispatch = useAppDispatch()

   const groupId = query.groupId as string

   const handleJobCreation = useCallback(() => {
      push(
         `/group/${groupId}/admin/jobs?${JOB_DIALOG_QUERY_KEYS.jobDialog}=true`
      )
   }, [push, groupId])

   const handleLiveStreamCreation = useCallback(() => {
      if (isCreating) return
      createDraftLivestream()
   }, [createDraftLivestream, isCreating])

   const handleSparkUpload = useCallback(() => {
      if (hasAccessToSparks) {
         dispatch(openSparkDialog())
      }
      push(`/group/${groupId}/admin/content/sparks`)
   }, [hasAccessToSparks, dispatch, push, groupId])

   const handleOfflineEventCreation = useCallback(async () => {
      if (isCreatingOfflineEvent) return
      await createDraftOfflineEvent()
   }, [createDraftOfflineEvent, isCreatingOfflineEvent])

   // Only show on desktop
   if (!isDesktop) {
      return null
   }

   return (
      <Box sx={styles.container}>
         <Stack direction="row" spacing={2} sx={styles.buttonsStack}>
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
                  Schedule a live stream
               </Typography>
            </Button>
            <Button
               sx={styles.quickActionButton}
               startIcon={<Calendar size={24} />}
               onClick={handleOfflineEventCreation}
               disabled={isCreatingOfflineEvent}
            >
               <Typography variant="brandedBody">
                  Publish an offline event
               </Typography>
            </Button>
            <Button
               sx={styles.quickActionButton}
               startIcon={<PlayCircle size={24} />}
               onClick={handleSparkUpload}
            >
               <Typography variant="brandedBody">Upload a Spark</Typography>
            </Button>
         </Stack>
      </Box>
   )
}
