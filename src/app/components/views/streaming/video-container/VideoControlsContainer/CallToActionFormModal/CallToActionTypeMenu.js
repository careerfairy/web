import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Card, DialogContent, Grid } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
   gridContainer: {},
}));

const CallToActionTypeCard = () => {
   return <Card></Card>;
};

const ctaTypes = [
   {
      title: "Promote your linkedIn",
      type: "linkedIn",
      description:
         "Help promote your linkedIn page by sending a call to action to your live viewers.",
   },
   {
      title: "Promote your Facebook",
      type: "facebook",
      description:
         "Help promote your facebook page by sending a call to action to your live viewers.",
   },
   {
      title: "Promote your Twitter",
      type: "twitter",
      description:
         "Help promote your twitter page by sending a call to action to your live viewers.",
   },
   {
      title: "Promote a Job Posting",
      type: "jobPosting",
      description:
         "Help promote an open position to your live viewers with a link to the job posting.",
   },
   {
      title: "Custom",
      type: "custom",
      description:
         "Create a custom call to action with a customized message, button text and link",
   },
];
const CallToActionTypeMenu = ({}) => {
   const classes = useStyles();

   return (
      <React.Fragment>
         <DialogContent>
            <Grid className={classes.gridContainer} container spacing={3}>
               {ctaTypes.map((type) => (
                  <Grid item xs={12} md={6} lg={4}>
                     <CallToActionTypeCard />
                  </Grid>
               ))}
            </Grid>
         </DialogContent>
      </React.Fragment>
   );
};

export default CallToActionTypeMenu;
