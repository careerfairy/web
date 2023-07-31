import {
   LinearProgress,
   Stack,
   Typography,
   linearProgressClasses,
} from "@mui/material"
import { FC } from "react"
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
   root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      height: "100%",
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

type Props = {
   name: string // name of the entity being uploaded (video or thumbnail)
   progress: number // progress of the file upload
   uploading: boolean // whether a file is uploading
}

const UploadOverlay: FC<Props> = ({ name, progress, uploading }) => {
   return (
      <Stack sx={styles.root} spacing={1} alignItems="center">
         <Typography sx={styles.percentText}>
            {uploading
               ? `${Math.round(progress)}% • uploading ${name} file`
               : "Your Spark is being created"}
         </Typography>
         <LinearProgress
            value={uploading ? progress : undefined}
            variant={uploading ? "determinate" : "indeterminate"}
            color="secondary"
            sx={styles.progressBar}
         />
      </Stack>
   )
}

export default UploadOverlay
