import React from "react";
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout";
import Page from "../../../../components/page";
import {makeStyles} from "@material-ui/core/styles";
import {CircularProgress, Container} from "@material-ui/core";

// the /admin page is just a redirect for now it also eareses it self from the browser history
const useStyles = makeStyles(theme => ({
    root: {
        height: "inherit",
        display: "grid",
        placeItems: "center"
    }
}))
const AdminPage = () => {
    const classes = useStyles()

    return (
        <Page title="CareerFairy | Admin">
            <Container className={classes.root} maxWidth="xl">
                <CircularProgress/>
            </Container>
        </Page>
    )
};

AdminPage.layout = GroupDashboardLayout

export default AdminPage;
