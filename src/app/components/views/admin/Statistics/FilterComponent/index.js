import React from 'react';
import {makeStyles, useTheme} from "@material-ui/core/styles";
import {Box, Grid} from "@material-ui/core";
import GroupAddButton from "./GroupAddButton";
import {useDispatch, useSelector} from "react-redux";
import FilterCard from "./FilterCard";
import * as actions from '../../../../../store/actions'
import {isLoaded} from "react-redux-firebase";
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"

const useStyles = makeStyles(theme => ({
    root: {
        width: "100%"
    },
    item: {}
}));

const FilterComponent = () => {
    const dispatch = useDispatch()
    const classes = useStyles()
    const filters = useSelector(state => state.currentFilterGroup.data.filters || [])
    const theme = useTheme()

    const groupsLoaded = useSelector(({firestore: {data: {careerCenterData}}}) => isLoaded(careerCenterData))
    const handleRemoveGroupFromFilters = (targetGroupId) => {
        const newFilters = filters.map(({groupId}) => groupId).filter(groupId => groupId !== targetGroupId)
        dispatch(actions.setFilters(newFilters))
    }

    return (
        <ResponsiveMasonry
            columnsCountBreakPoints={{350: 1, 800: 2, 1280: 2, 1450: 3}}

        >
            <Masonry gutter={`${theme.spacing(2)}px`}>
                {filters.map(filter => (
                    <FilterCard groupsLoaded={groupsLoaded} handleRemoveGroupFromFilters={handleRemoveGroupFromFilters}
                                key={filter.groupId} filter={filter}/>
                ))}
                <Box display="flex" justifyContent="center">
                    <GroupAddButton/>
                </Box>
            </Masonry>
        </ResponsiveMasonry>
    )
};

FilterComponent.propTypes = {}
export default FilterComponent;

