import React from "react";
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout";
import { makeStyles } from "@material-ui/core/styles";
import { CircularProgress, Container } from "@material-ui/core";
import DashboardHead from "../../../../layouts/GroupDashboardLayout/DashboardHead";

// the /admin page is just a redirect for now it also eareses it self from the browser history
const useStyles = makeStyles((theme) => ({
   root: {
      height: "inherit",
      display: "grid",
      placeItems: "center",
   },
}));
const AdminPage = () => {
   const classes = useStyles();

   return (
      <GroupDashboardLayout>
         <DashboardHead title="CareerFairy | Admin" />
         <Container className={classes.root} maxWidth="xl">
            <CircularProgress />
         </Container>
      </GroupDashboardLayout>
   );
};

export default AdminPage;
