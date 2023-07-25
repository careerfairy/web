import { Box, Stack } from "@mui/material"
import { FC } from "react"
import SparksDialog from "../../SparksDialog"
import LinearProgress, {
   linearProgressClasses,
} from "@mui/material/LinearProgress"
import { Typography } from "@mui/material"
import ThumbsUpIcon from "components/views/common/icons/ThumbsUpIcon"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   progressBar: {
      width: "100%",
      height: 10,
      borderRadius: 5,
      bgcolor: "grey.300",
      [`& .${linearProgressClasses.bar}`]: {
         borderRadius: 5,
      },
   },
   thumbsUpIcon: {
      width: 154,
      height: 154,
   },
   root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
   },
   progressWrapper: {
      width: "100%",
   },
   percentText: {
      color: "#828282",
      textAlign: "center",
      fontSize: "1.14286rem",
      fontWeight: 400,
      lineHeight: "150%",
      letterSpacing: "-0.02171rem",
   },
})

export type SubmittingOverlayProps = {
   progress: number // progress of the file upload
   uploading: boolean // weather a file is uploading
}

export const SubmittingOverlay: FC<SubmittingOverlayProps> = ({
   progress,
   uploading,
}) => {
   return (
      <SparksDialog.Container hideCloseButton width={652}>
         <Box sx={styles.root}>
            <ThumbsUpIcon sx={styles.thumbsUpIcon} />
            <Box mt={4} />
            <SparksDialog.Title>
               Uploading your{" "}
               <Box component="span" color="secondary.main">
                  Spark
               </Box>
            </SparksDialog.Title>
            <Box mt={10.5} />
            <Stack sx={styles.progressWrapper} spacing={1} alignItems="center">
               <Typography sx={styles.percentText}>
                  {uploading
                     ? `${Math.round(progress)}% • uploading video file`
                     : "Your Spark is being created"}
               </Typography>
               <LinearProgress
                  value={uploading ? progress : undefined}
                  variant={uploading ? "determinate" : "indeterminate"}
                  color="secondary"
                  sx={styles.progressBar}
               />
            </Stack>
         </Box>
      </SparksDialog.Container>
   )
}
