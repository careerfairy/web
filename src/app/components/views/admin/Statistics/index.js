import React, {useEffect} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Container, Grid} from "@material-ui/core";
import FilterComponent from "./FilterComponent";
import useGetAllGroups from "../../../custom-hook/useGetAllGroups";
import {useFirestore} from "react-redux-firebase";
import Toolbar from "./Toolbar";
import {useSelector} from "react-redux";

const useStyles = makeStyles(theme => ({
    root: {
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
    const currentFilterGroup = useSelector(state => state.currentFilterGroup)
    console.log("-> currentFilterGroup", currentFilterGroup);
    useEffect(() => {
        (async function getAllGroups() {
            await firestore.get({
                collection: "careerCenterData"
            })
        })()
    }, [])

    const handleQueryCurrentFilterGroup = async (e) => {
        e.preventDefault?.()
        alert("hi")
    }
    return (
        <Container className={classes.root} maxWidth={false}>
            <Grid onSubmit={handleQueryCurrentFilterGroup} component="form" container spacing={2}>
                <Grid item xs={12}>
                    <Toolbar handleQueryCurrentFilterGroup={handleQueryCurrentFilterGroup}/>
                </Grid>
                <Grid item xs={12}>
                    <FilterComponent/>
                </Grid>
            </Grid>
        </Container>
    );
};

export default StatisticsOverview;
