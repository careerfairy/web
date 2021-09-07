import React, { Fragment } from "react";
import { Grid, Typography } from "@material-ui/core";
import { withFirebase } from "context/firebase";
import CurrentGroup from "components/views/profile/CurrentGroup";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
   header: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "20px",
      flexWrap: "wrap",
   },
   title: {
      color: "rgb(160,160,160)",
      margin: "0 0 10px 0",
      fontWeight: "300",
   },
}));

const AdminGroups = ({ userData, adminGroups }) => {
   const classes = useStyles();

   let adminGroupElements = [];

   if (userData) {
      adminGroupElements = adminGroups.map((group) => {
         return (
            <Fragment key={group.id}>
               <CurrentGroup isAdmin={true} group={group} userData={userData} />
            </Fragment>
         );
      });
   }

   return (
      <Fragment>
         <div>
            <div className={classes.header}>
               <Typography className={classes.title} variant="h5">
                  Admin Groups
               </Typography>
            </div>
            {adminGroupElements.length ? (
               <Grid style={{ marginBottom: 50 }} container spacing={3}>
                  {adminGroupElements}
               </Grid>
            ) : (
               <Typography gutterBottom>
                  You are currently not an admin of any career group.
               </Typography>
            )}
         </div>
      </Fragment>
   );
};

export default withFirebase(AdminGroups);
