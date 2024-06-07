import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { List, ListItem, Typography } from "@mui/material"
import SteppedDialog from "components/views/stepped-dialog/SteppedDialog"
import { FC, ReactElement } from "react"
import { Radio } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   title: {
      fontSize: { xs: "18px", md: "20px" },
      px: "30px",
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
   linkedJobs: CustomJob[]
   contentType: "spark" | "livestream"
}

const DeleteLinkedContentDialog: FC<Props> = ({ linkedJobs, contentType }) => {
   const isSpark = contentType === "spark"

   return (
      <>
         <Radio color={"#FF4545"} size={48} />

         <SteppedDialog.Title sx={styles.title}>
            {`This ${
               isSpark ? "Spark" : "live stream"
            } is linked to the following jobs:`}
         </SteppedDialog.Title>

         <ListContent jobs={linkedJobs} />

         <SteppedDialog.Subtitle sx={styles.subtitle}>
            {`Deleting this ${
               isSpark ? "Spark" : "live stream"
            } will prevent talent to gain better information on your vacancy.`}
         </SteppedDialog.Subtitle>
      </>
   )
}

type ListContentProps = {
   jobs: CustomJob[]
}

const ListContent: FC<ListContentProps> = ({ jobs }) => {
   const [firstJob, secondJob] = jobs
   const contentToShow: { id: string; message: ReactElement }[] = []

   contentToShow.push({
      id: firstJob.id,
      message: (
         <Typography sx={styles.listMessage}>{firstJob.title}</Typography>
      ),
   })

   if (secondJob) {
      contentToShow.push({
         id: secondJob.id,
         message: (
            <Typography sx={styles.listMessage}>{secondJob.title}</Typography>
         ),
      })
   }

   if (jobs.length > 2) {
      const additionalJobs = jobs.length - 2

      contentToShow.push({
         id: "additionalJobs",
         message: (
            <Typography
               sx={styles.listMessage}
            >{`+ ${additionalJobs} job openings`}</Typography>
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

export default DeleteLinkedContentDialog
