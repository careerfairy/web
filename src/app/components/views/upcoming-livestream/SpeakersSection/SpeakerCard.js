import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
   Card,
   CardContent,
   CardMedia,
   ListItemText,
   Paper,
} from "@material-ui/core";
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions";

const useStyles = makeStyles((theme) => ({
   root: {
      borderRadius: theme.spacing(0.5),
      overflow: "hidden",
      color: theme.palette.text.secondary,
      backgroundColor: "transparent",
   },
   cardMedia: {
      display: "block",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center center",
      borderRadius: theme.spacing(1),
      width: "100%",
      height: "100%",
      minHeight: 320,
   },
   cardContent: {
      padding: theme.spacing(2),
      marginTop: theme.spacing(-5),
      backgroundColor: "transparent",
   },
   innerCard: {
      borderRadius: theme.spacing(1),
   },
   innerCardContent: {
      padding: theme.spacing(2),
   },
}));
const SpeakerCard = ({ speaker }) => {
   const classes = useStyles();

   return (
      <Card elevation={0} className={classes.root}>
         <CardMedia
            className={classes.cardMedia}
            image={getResizedUrl(speaker.avatar, "md")}
         />
         <CardContent className={classes.cardContent}>
            <Card className={classes.innerCard} elevation={3}>
               <Paper className={classes.innerCardContent}>
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
   );
};

export default SpeakerCard;
