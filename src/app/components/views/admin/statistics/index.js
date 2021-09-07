import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Backdrop, CircularProgress, Container, Grid } from "@material-ui/core";
import UniversityCountriesChart from "./UniversityCountriesChart";
import { useFirestoreConnect } from "react-redux-firebase";

const useStyles = makeStyles((theme) => ({
   root: {
      backgroundColor: theme.palette.background.dark,
      minHeight: "100%",
      paddingBottom: theme.spacing(3),
      paddingTop: theme.spacing(3),
      width: "100%",
   },
   backdrop: {
      zIndex: theme.zIndex.tooltip,
   },
}));

const StatisticsOverview = () => {
   const classes = useStyles();

   useFirestoreConnect(() => [
      {
         collection: "analytics",
         doc: "userData",
         storeAs: "universityCountryDistribution",
      },
   ]);

   return (
      <Container className={classes.root} maxWidth={false}>
         <Grid container spacing={2}>
            <Grid item>
               <UniversityCountriesChart />
            </Grid>
         </Grid>
         <Backdrop className={classes.backdrop} open={false}>
            <CircularProgress color="inherit" />
         </Backdrop>
      </Container>
   );
};

export default StatisticsOverview;
