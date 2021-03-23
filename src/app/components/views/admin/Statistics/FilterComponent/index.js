import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Grid} from "@material-ui/core";
import FilterCard from "./FilterCard";
import GroupAddButton from "./GroupAddButton";

const useStyles = makeStyles(theme => ({
    root: {
        width: "100%"
    }
}));

const FilterComponent = ({}) => {

    const classes = useStyles()

    return (
        <Grid alignContent="center" alignItems="center" container spacing={2} className={classes.root}>
            <Grid item>
                <FilterCard/>
            </Grid>
            <Grid  item>
                <GroupAddButton/>
            </Grid>
        </Grid>
    );
};

export default FilterComponent;
