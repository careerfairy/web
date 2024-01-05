import { Radio } from "react-feather"
import SteppedDialog from "../../../../../stepped-dialog/SteppedDialog"
import { Box, CircularProgress, List, ListItem } from "@mui/material"
import Typography from "@mui/material/Typography"
import React, { FC } from "react"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { sxStyles } from "../../../../../../../types/commonTypes"
import useCustomJobLinkedLivestreams from "../../../../../../custom-hook/custom-job/useCustomJobLinkedLivestreams"
import Loader from "../../../../../loader/Loader"
import { SuspenseWithBoundary } from "../../../../../../ErrorBoundary"

const styles = sxStyles({
   title: {
      fontSize: { xs: "18px", md: "20px" },
   },
   subtitle: {
      maxWidth: "unset",
      fontSize: { xs: "16px", md: "16px" },
   },
   listWrapper: {
      width: "100%",
      px: 3,
      py: 2,
      my: 3,
      background: "#F6F6FA",
      borderRadius: "4px",
      listStyleType: "disc",
   },
   loading: {
      py: 3,
   },
   listItem: {
      display: "list-item",
      px: 0,
      mx: 2,
   },
   livestreamTitle: {
      fontSize: "16px",
      color: "#3D3D47",
   },
})

type Props = {
   job: CustomJob | null
}
const DeleteJobDialogWithLinkedLivestreams: FC<Props> = ({ job }) => {
   const hasLinkedLivestreams = Boolean(job?.livestreams?.length)

   return (
      <>
         <Radio color={"#FF4545"} size={48} />

         <SteppedDialog.Title sx={styles.title}>
            This job post is linked to the following upcoming live streams:
         </SteppedDialog.Title>

         {hasLinkedLivestreams ? (
            <SuspenseWithBoundary fallback={<Loader />}>
               <ListContent job={job} />
            </SuspenseWithBoundary>
         ) : (
            <Box sx={[styles.listWrapper, styles.loading]}>
               <CircularProgress size={20} color="inherit" />
            </Box>
         )}

         <SteppedDialog.Subtitle sx={styles.subtitle}>
            Deleting this job post will remove its links to these live streams.
         </SteppedDialog.Subtitle>
      </>
   )
}

type ListContentProps = {
   job: CustomJob
}
const ListContent: FC<ListContentProps> = ({ job }) => {
   const linkedLivestreams = useCustomJobLinkedLivestreams(job)

   const linkedLivestreamsToShow = linkedLivestreams.reduce(
      (acc, currentValue, index) => {
         if (index < 2 || (linkedLivestreams.length === 3 && index === 2)) {
            acc.push({
               id: currentValue.id,
               title: currentValue.title || "Draft livestream",
            })
         }

         if (linkedLivestreams.length > 3 && index === 2) {
            const additionalLivestreams = linkedLivestreams.length - 2

            acc.push({
               id: currentValue.id,
               title: `+${additionalLivestreams} additional live streams`,
            })
         }

         return acc
      },
      [] as { id: string; title: string }[]
   )

   return (
      <List sx={styles.listWrapper}>
         {linkedLivestreamsToShow.map((livestream) => (
            <ListItem key={livestream.id} sx={styles.listItem}>
               <Typography sx={styles.livestreamTitle}>
                  {livestream.title}
               </Typography>
            </ListItem>
         ))}
      </List>
   )
}
export default DeleteJobDialogWithLinkedLivestreams
