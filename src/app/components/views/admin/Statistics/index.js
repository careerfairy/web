import React, {useEffect} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Container, Grid} from "@material-ui/core";
import FilterComponent from "./FilterComponent";
import useGetAllGroups from "../../../custom-hook/useGetAllGroups";
import {useFirestore} from "react-redux-firebase";

const useStyles = makeStyles(theme => ({
    root:{
        backgroundColor: theme.palette.background.dark,
        minHeight: "100%",
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3),
        width: "100%"
    }
}));

const StatisticsOverview = (props) => {

    const classes = useStyles()
    const firestore = useFirestore()

    useEffect(() => {
        (async function getAllGroups() {
            await firestore.get({
                collection: "careerCenterData"
            })
        })()
    }, [])

    return (
        <Container className={classes.root} maxWidth={false}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <FilterComponent/>
                </Grid>
            </Grid>
        </Container>
    );
};

export default StatisticsOverview;
