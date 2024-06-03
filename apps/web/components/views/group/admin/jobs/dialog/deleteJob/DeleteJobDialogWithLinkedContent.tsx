import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box, CircularProgress, List, ListItem } from "@mui/material"
import Typography from "@mui/material/Typography"
import useCustomJobLinkedSparks from "components/custom-hook/custom-job/useCustomJobLinkedSparks"
import { FC, ReactElement } from "react"
import { Radio } from "react-feather"
import { sxStyles } from "../../../../../../../types/commonTypes"
import { SuspenseWithBoundary } from "../../../../../../ErrorBoundary"
import useCustomJobLinkedLivestreams from "../../../../../../custom-hook/custom-job/useCustomJobLinkedLivestreams"
import Loader from "../../../../../loader/Loader"
import SteppedDialog from "../../../../../stepped-dialog/SteppedDialog"

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
   listMessage: {
      fontSize: "16px",
      color: (theme) => theme.palette.neutral[800],
      alignItems: "center",
   },
})

type Props = {
   job: CustomJob | null
}
const DeleteJobDialogWithLinkedContent: FC<Props> = ({ job }) => {
   const hasLinkedContent = Boolean(job.livestreams.length || job.sparks.length)

   return (
      <>
         <Radio color={"#FF4545"} size={48} />

         <SteppedDialog.Title sx={styles.title}>
            This job post is linked to the following content:
         </SteppedDialog.Title>

         {hasLinkedContent ? (
            <SuspenseWithBoundary fallback={<Loader />}>
               <ListContent job={job} />
            </SuspenseWithBoundary>
         ) : (
            <Box sx={[styles.listWrapper, styles.loading]}>
               <CircularProgress size={20} color="inherit" />
            </Box>
         )}

         <SteppedDialog.Subtitle sx={styles.subtitle}>
            Deleting this job post will unlink it from this content.
         </SteppedDialog.Subtitle>
      </>
   )
}

type ListContentProps = {
   job: CustomJob
}

const ListContent: FC<ListContentProps> = ({ job }) => {
   const linkedLivestreams = useCustomJobLinkedLivestreams(job)
   const linkedSparks = useCustomJobLinkedSparks(job)

   const contentToShow: { id: string; message: ReactElement }[] = []

   const [livestream] = linkedLivestreams
   const [spark] = linkedSparks

   /**
    * If both livestream and spark exist, add them to the contentToShow array
    */
   if (livestream && spark) {
      contentToShow.push(
         {
            id: livestream.id,
            message: (
               <Typography sx={styles.listMessage}>
                  <b>Live stream - </b> {livestream.title || "Draft livestream"}
               </Typography>
            ),
         },
         {
            id: spark.id,
            message: (
               <Typography sx={styles.listMessage}>
                  <b>Spark - </b> {spark.question}
               </Typography>
            ),
         }
      )
   } else if (livestream && !spark) {

   /**
    * If only livestream exists, add it to the contentToShow array
    * and check if there's a second livestream to add as well
    */
      const [, secondLivestream] = linkedLivestreams

      contentToShow.push({
         id: livestream.id,
         message: (
            <Typography sx={styles.listMessage}>
               <b> Live stream - </b> {livestream.title || "Draft livestream"}
            </Typography>
         ),
      })

      if (secondLivestream) {
         contentToShow.push({
            id: secondLivestream.id,
            message: (
               <Typography sx={styles.listMessage}>
                  <b> Live stream - </b>{" "}
                  {secondLivestream.title || "Draft livestream"}
               </Typography>
            ),
         })
      }
   } else if (spark && !livestream) {

   /**
    * If only spark exists, add it to the contentToShow array
    * and check if there's a second spark to add as well
    */
      const [, secondSpark] = linkedSparks

      contentToShow.push({
         id: spark.id,
         message: (
            <Typography sx={styles.listMessage}>
               <b> Spark - </b> {spark.question}
            </Typography>
         ),
      })

      if (secondSpark) {
         contentToShow.push({
            id: secondSpark.id,
            message: (
               <Typography sx={styles.listMessage}>
                  <b> Spark - </b> {secondSpark.question}
               </Typography>
            ),
         })
      }
   }

   /**
    * Calculate the total number of linked content and the number of additional content
    */
   const totalLinkedContent = linkedLivestreams.length + linkedSparks.length
   const additionalContent = totalLinkedContent - contentToShow.length

   /**
    * If there's additional content, add a message to the contentToShow array
    */
   if (additionalContent > 0) {
      contentToShow.push({
         id: "additionalContent",
         message: (
            <Typography
               sx={styles.listMessage}
            >{`+ ${additionalContent} additional linked content`}</Typography>
         ),
      })
   }

   return (
      <List sx={styles.listWrapper}>
         {contentToShow.map(({ id, message }) => (
            <ListItem key={id} sx={styles.listItem}>
               {message}
            </ListItem>
         ))}
      </List>
   )
}
export default DeleteJobDialogWithLinkedContent
