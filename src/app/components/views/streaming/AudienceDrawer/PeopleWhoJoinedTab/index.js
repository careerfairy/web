import PropTypes from 'prop-types'
import React, {Fragment, useEffect, useState} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {FormControl, Grid, InputLabel, MenuItem, Select, TextField} from "@material-ui/core";
import UserList from "./UserList";
import {isEmpty, isLoaded} from "react-redux-firebase";
import {useCurrentStream} from "../../../../../context/stream/StreamContext";
import EmptyDisplay from "../displays/EmptyDisplay";
import LoadingDisplay from "../displays/LoadingDisplay";

const useStyles = makeStyles(theme => ({
    searchGridWrapper: {
        padding: theme.spacing(1, 1, 0, 1),
    },
}));
const TALENT_POOL_OPTION = "Talent pool"
const ALL_OPTION = "All"
const options = [
    ALL_OPTION,
    TALENT_POOL_OPTION
]

const PeopleWhoJoinedTab = ({isStreamer, participatingStudents}) => {

    const classes = useStyles()
    const {currentLivestream: {talentPool}} = useCurrentStream()

    const [searchParams, setSearchParams] = useState("");
    const [currentOption, setCurrentOption] = useState(options[0]);

    const [filteredAudience, setFilteredAudience] = useState(undefined);

    const handleFilter = (arrayOfUserObjects) => {
        if(!arrayOfUserObjects) return arrayOfUserObjects
        let filtered = arrayOfUserObjects.filter(user =>
            user.firstName?.toLowerCase().includes(searchParams)
            || user.lastName?.toLowerCase().includes(searchParams)
            || user.universityName?.toLowerCase().includes(searchParams)
        )
        if (currentOption === TALENT_POOL_OPTION) {
            filtered = filtered.filter(user => talentPool?.includes(user.id))
        }
        return filtered
    }

    useEffect(() => {
        setFilteredAudience(handleFilter(participatingStudents))
    }, [participatingStudents, searchParams, currentOption])


    const handleSearch = (e) => {
        setSearchParams(e.currentTarget.value.toLowerCase())
    }
    const handleFilterOptions = (e) => {
        const value = e.target.value
        setCurrentOption(value)
    }

    return (
        <Fragment>
            <Grid className={classes.searchGridWrapper} container spacing={1}>
                <Grid item xs={isStreamer ? 9 : 12}>
                    <TextField
                        fullWidth
                        value={searchParams}
                        onChange={handleSearch}
                        label="Search for people..."
                    />
                </Grid>
                {isStreamer &&
                <Grid item xs={3}>
                    <FormControl fullWidth>
                        <InputLabel id="audience-select">filter:</InputLabel>
                        <Select
                            labelId="audience-select"
                            id="audience-select"
                            value={currentOption}
                            onChange={handleFilterOptions}
                        >
                            {options.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>}
            </Grid>
            {!isLoaded(participatingStudents) ?
                <LoadingDisplay/> :
                isEmpty(participatingStudents) ?
                    <EmptyDisplay text="Not enough data"/> :
                    <UserList isStreamer={isStreamer} audience={filteredAudience}/>}
        </Fragment>
    );
};

PeopleWhoJoinedTab.propTypes = {
    isStreamer: PropTypes.bool.isRequired
}

export default PeopleWhoJoinedTab;

