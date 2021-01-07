import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Container} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Profile from "./Profile";
import ProfileDetails from "./ProfileDetails";

const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    }
}));

const EditOverview = ({firebase, group}) => {

    const classes = useStyles()

    return (
        <Container className={classes.root} maxWidth="lg">
            <Grid
                container
                spacing={3}
            >
                <Grid
                    item
                    lg={4}
                    md={6}
                    xs={12}
                >
                    <Profile group={group}/>
                </Grid>
                <Grid
                    item
                    lg={8}
                    md={6}
                    xs={12}
                >
                    <ProfileDetails/>
                </Grid>
            </Grid>
        </Container>
    );
};

export default EditOverview;
