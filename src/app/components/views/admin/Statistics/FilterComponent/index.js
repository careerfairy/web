import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Grid} from "@material-ui/core";
import GroupAddButton from "./GroupAddButton";
import {useDispatch, useSelector} from "react-redux";
import FilterCard from "./FilterCard";
import * as actions from '../../../../../store/actions'
import {isLoaded} from "react-redux-firebase";
const useStyles = makeStyles(theme => ({
    root: {
        width: "100%"
    },
    item:{
    }
}));

const FilterComponent = ({}) => {
    const dispatch = useDispatch()
    const classes = useStyles()
    const filters = useSelector(state => state.currentFilterGroup.data.filters || [])

    const groupsLoaded = useSelector(({firestore:{data:{careerCenterData}}}) => isLoaded(careerCenterData))
    const handleRemoveGroupFromFilters = (targetGroupId) => {
        const newFilters = filters.map(({groupId}) => groupId).filter(groupId => groupId !== targetGroupId)
        dispatch(actions.setFilters(newFilters))
    }

    return (
        <Grid alignContent="center" alignItems="center" container spacing={2} className={classes.root}>
            {filters.map(filter => (
                <Grid className={classes.item} xs={12} md={6} lg={4}  key={filter.groupId} item>
                    <FilterCard groupsLoaded={groupsLoaded} handleRemoveGroupFromFilters={handleRemoveGroupFromFilters} key={filter.groupId} filter={filter}/>
                </Grid>
            ))}
            <Grid item>
                <GroupAddButton/>
            </Grid>
        </Grid>
    );
};

export default FilterComponent;
