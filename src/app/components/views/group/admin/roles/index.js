import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Container, Grid, Typography} from "@material-ui/core";
import MembersTable from "./MembersTables";
import {useSelector} from "react-redux";

const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    }
}));

const RolesOverview = ({firebase, group}) => {

    const classes = useStyles()
    const firestore = useSelector(state => state.firestore)
    console.log("-> firestore", firestore);

    return (
        <Container className={classes.root} maxWidth="lg">
            <Typography variant="h1">
                Roles
            </Typography>
            <Grid
                container
                spacing={3}
            >
                <Grid item xs={12} sm={12}>
                    <MembersTable
                        group={group}
                    />
                </Grid>
            </Grid>
        </Container>
    );
};

export default RolesOverview;
