import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Container, Grid} from "@material-ui/core";
import FilterComponent from "./FilterComponent";

const useStyles = makeStyles(theme => ({}));

const StatisticsOverview = (props) => {

    console.log("-> props", props);
    const classes = useStyles()

    return (
        <Container maxWidth={false}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <FilterComponent/>
                </Grid>
            </Grid>
        </Container>
    );
};

export default StatisticsOverview;
