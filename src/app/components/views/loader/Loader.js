import { CircularProgress } from "@mui/material";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => {
   const themeWhite = theme.palette.common.white;
   return {
      loadingContainer: {
         position: "absolute",
         top: 0,
         left: 0,
         backgroundColor: themeWhite,
         height: "100%",
         width: "100%",
      },
   };
});

const Loader = () => {
   const classes = useStyles();

   return (
      <div className={classes.loadingContainer}>
         <CircularProgress
            src="/loader.gif"
            style={{ position: "fixed", top: "50%", left: "50%" }}
         />
      </div>
   );
};

export default Loader;
