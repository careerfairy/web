import { Button, Typography } from "@mui/material"
import makeStyles from "@mui/styles/makeStyles"
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard"
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople"

const useStyles = makeStyles((theme) => ({
   waitingOverlay: {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor:
         theme.palette.mode === "dark"
            ? theme.palette.common.black
            : theme.palette.background.paper,
      zIndex: 999,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
   },
   waitingContent: {
      width: "50%",
   },
   waitingText: {
      fontSize: "1.3em",
      fontWeight: "700",
      textAlign: "center",
      padding: theme.spacing(0, 3),
      marginBottom: 30,
   },
   subTitle: {},
   mainTitle: {
      marginBottom: 40,
      fontSize: "2rem",
      fontWeight: 700,
      color: "rgb(100,100,100)",
   },
   marginBottom: {
      marginBottom: 30,
      "& em": {
         fontWeight: 700,
         fontStyle: "normal",
      },
   },
   buttonMarginBottom: {
      marginBottom: 30,
   },
}))

const StreamStoppedOverlay = () => {
   const classes = useStyles()

   return (
      <div className={classes.waitingOverlay}>
         <div className={classes.waitingContent}>
            <Typography className={classes.waitingText}>
               Thanks for joining the stream!
            </Typography>
         </div>
      </div>
   )
}

export default StreamStoppedOverlay
