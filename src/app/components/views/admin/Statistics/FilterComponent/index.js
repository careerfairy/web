import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Grid} from "@material-ui/core";
import GroupAddButton from "./GroupAddButton";
import {useSelector} from "react-redux";
import FilterCard from "./FilterCard";

const useStyles = makeStyles(theme => ({
    root: {
        width: "100%"
    }
}));

const FilterComponent = ({}) => {

    const classes = useStyles()
    const filters = useSelector(state => state.currentFilterGroup.data.filters || [])
    console.log("-> filters", filters);

    return (
        <Grid alignContent="center" alignItems="center" container spacing={2} className={classes.root}>
            {filters.map(filter => (
                <Grid item>
                    <FilterCard key={filter.groupId} filter={filter}/>
                </Grid>
            ))}
            <Grid item>
                <GroupAddButton/>
            </Grid>
        </Grid>
    );
};

export default FilterComponent;
