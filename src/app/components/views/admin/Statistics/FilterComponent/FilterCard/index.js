import PropTypes from 'prop-types'
import React, {useEffect} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Card, CardContent, CardHeader, CircularProgress, IconButton} from "@material-ui/core";
import * as actions from '../../../../../../store/actions'
import {useDispatch, useSelector} from "react-redux";
import useFollowers from "../../../../../custom-hook/useFollowers";
import CategorySelect from "./CategorySelect";
import DeleteFilterIcon from '@material-ui/icons/DeleteForever';
import {isEmpty, isLoaded} from "react-redux-firebase";
import Skeleton from "@material-ui/lab/Skeleton";
import GroupsUtil from "../../../../../../data/util/GroupsUtil";

const useStyles = makeStyles(theme => ({}));

const FilterCard = ({filter, handleRemoveGroupFromFilters, groupsLoaded}) => {
    console.log("-> filter", filter);
    const dispatch = useDispatch()
    const {filterOptions, groupId} = filter
    console.log("-> filterOptions", filterOptions);
    // const {loading} = useFollowers(groupId)
    const group = useSelector(state => state.firestore.data.careerCenterData?.[groupId])

    useEffect(() => {

    }, [group])

    useEffect(() => {
        if (groupsLoaded) {
            handleCheckForRedundantFilters(group, filterOptions, groupId)
        }
    }, [groupsLoaded])

    const handleCheckForRedundantFilters = (group, groupFilterOptions, groupId) => {
        if (isEmpty(group)) return handleRemoveGroupFromFilters(groupId)
        const check = hasRedundantFilterOptions(filterOptions, group.categories)
        if (check.hasRedundant) {
            handleRemoveRedundantFilterOptions(check.filteredGroupFilterOptionCategoryIds, groupId)
        }
        handleCheckAndRemoveRedundantTargetOptions(groupFilterOptions, group)

    }
    const categoryExists = (groupCategories, targetCategoryId) => {
        return groupCategories.find(category => category.id === targetCategoryId)
    }

    const hasRedundantFilterOptions = (groupFilterOptions, groupCategories) => {
        const filteredGroupFilterOptionCategoryIds = groupFilterOptions.map(category => category.categoryId)
            .filter(categoryId => categoryExists(groupCategories, categoryId))
        return {
            hasRedundant: checkIfRedundant(filteredGroupFilterOptionCategoryIds, groupFilterOptions),
            filteredGroupFilterOptionCategoryIds
        }
    }

    const checkIfRedundant = (array1, array2) => {
        return array1?.length !== array2?.length
    }

    const handleRemoveRedundantFilterOptions = (categoryIds, groupId) => {
        dispatch(actions.setFilterOptions(categoryIds, groupId))
    }

    const handleRemoveRedundantTargetOptions = (targetOptionIds, categoryId, groupId) => {
        dispatch(actions.setFilterOptionTargetOptions(targetOptionIds, categoryId, groupId))
    }

    const handleCheckAndRemoveRedundantTargetOptions = (groupFilterOptions, group) => {
        const flattenedGroupOptions = GroupsUtil.handleFlattenOptions(group)
        groupFilterOptions.forEach(filterOption => {
            const filteredTargetOptions = filterOption.targetOptionIds.filter(optionId => flattenedGroupOptions.some(({id}) => id === optionId))
            const isRedundant = checkIfRedundant(filterOption.targetOptionIds, filteredTargetOptions)
            if (isRedundant) {
                handleRemoveRedundantTargetOptions(filteredTargetOptions, filterOption.categoryId, group.groupId)
            }
        })
    }


    const classes = useStyles()

    return (
        <Card>
            <CardHeader
                title={
                    !isLoaded(group) ? (
                        <Skeleton animation="wave" height={10} width="80%" style={{marginBottom: 6}}/>
                    ) : (
                        `${group.universityName}`
                    )
                }
                subheader="Eth students"
                action={
                    <IconButton>
                        <DeleteFilterIcon/>
                    </IconButton>
                }
            />
            <CardContent>
                {!isLoaded(group) ? (
                    <React.Fragment>
                        <Skeleton animation="wave" height={10} style={{marginBottom: 6}}/>
                        <Skeleton animation="wave" height={10} width="80%"/>
                    </React.Fragment>
                ) : (
                    <React.Fragment>
                        {filterOptions.map(option => <CategorySelect categoryData={group.categories}
                                                                     key={option.category}
                                                                     option={option}/>)}
                    </React.Fragment>
                )}

            </CardContent>
        </Card>
    );
};

FilterCard.propTypes = {
    filter: PropTypes.shape({
        groupId: PropTypes.string.isRequired,
        filterOptions: PropTypes.arrayOf(PropTypes.shape({
            categoryId: PropTypes.string,
            targetOptions: PropTypes.arrayOf(PropTypes.string)
        }))
    }).isRequired,
    groupsLoaded: PropTypes.bool.isRequired,
    handleRemoveGroupFromFilters: PropTypes.func.isRequired
}
export default FilterCard;

