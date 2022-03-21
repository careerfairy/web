import React from "react"
import {
   Card,
   CardContent,
   CardMedia,
   ListItemText,
   Paper,
} from "@mui/material"
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions"
import { speakerPlaceholder } from "../../../util/constants"

const styles = {
   root: {
      borderRadius: (theme) => theme.spacing(0.5),
      overflow: "hidden",
      color: (theme) => theme.palette.text.secondary,
      backgroundColor: "transparent",
   },
   cardMedia: {
      display: "block",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center center",
      borderRadius: (theme) => theme.spacing(1),
      width: "100%",
      height: "100%",
      minHeight: "320px",
      boxShadow: 3,
   },
   cardContent: {
      padding: (theme) => theme.spacing(2),
      marginTop: (theme) => theme.spacing(-5),
      backgroundColor: "transparent",
   },
   innerCard: {
      borderRadius: (theme) => theme.spacing(1),
   },
   innerCardContent: {
      padding: (theme) => theme.spacing(2),
   },
}
const SpeakerCard = ({ speaker }) => {
   return (
      <Card elevation={0} sx={styles.root}>
         <CardMedia
            sx={styles.cardMedia}
            image={
               speaker.avatar
                  ? getResizedUrl(speaker.avatar, "md")
                  : speakerPlaceholder
            }
         />
         <CardContent sx={styles.cardContent}>
            <Card sx={styles.innerCard} elevation={3}>
               <Paper sx={styles.innerCardContent}>
                  <ListItemText
                     primary={
                        <b>{`${speaker.firstName || ""} ${
                           speaker.lastName || ""
                        } `}</b>
                     }
                     secondary={
                        <>
                           <b>{speaker.position}</b>
                           <br />
                           {speaker.background}
                        </>
                     }
                     primaryTypographyProps={{ color: "textSecondary" }}
                  />
               </Paper>
            </Card>
         </CardContent>
      </Card>
   )
}

export default SpeakerCard
