import { Button, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CardGiftcardIcon from "@material-ui/icons/CardGiftcard";
import EmojiPeopleIcon from "@material-ui/icons/EmojiPeople";

const useStyles = makeStyles((theme) => ({
   waitingOverlay: {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor:
         theme.palette.type === "dark"
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
}));

const StreamStoppedOverlay = () => {
   const classes = useStyles();

   return (
      <>
         <div className={classes.waitingOverlay}>
            <div className={classes.waitingContent}>
               <Typography className={classes.waitingText}>
                  Thanks for joining the stream!
               </Typography>
               <Typography className={classes.mainTitle}>
                  We need your input!
               </Typography>
               <Typography>
                  We are currently improving CareerFairy to help you land your
                  dream job.
               </Typography>
               <Typography className={classes.marginBottom}>
                  Click on the button below to help us by{" "}
                  <em>filling out our short Typeform survey</em> and answering a
                  few questions about your experience.
               </Typography>
               <a
                  href="https://mf82k3pxiqx.typeform.com/to/wI7YFVbC"
                  target="_blank"
               >
                  <Button
                     variant="contained"
                     size="large"
                     color="secondary"
                     className={classes.buttonMarginBottom}
                     startIcon={<EmojiPeopleIcon />}
                  >
                     I want to help!
                  </Button>
               </a>
               <Typography>Thank you for your contribution!</Typography>
            </div>
         </div>
      </>
   );
};

export default StreamStoppedOverlay;
