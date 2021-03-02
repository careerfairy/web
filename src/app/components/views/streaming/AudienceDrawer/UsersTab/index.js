import PropTypes from 'prop-types'
import React, {Fragment, useState} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {FormControl, Grid, InputLabel, MenuItem, Select, TextField} from "@material-ui/core";
import UserList from "./UserList";
import {useSelector} from "react-redux";
import {useCurrentStream} from "../../../../../context/stream/StreamContext";

const useStyles = makeStyles(theme => ({
    searchGridWrapper: {
        padding: theme.spacing(1, 1, 0, 1),
    }
}));
const TALENT_POOL_OPTION = "In talent pool"
const ALL_OPTION = "All"
const options = [
    ALL_OPTION,
    TALENT_POOL_OPTION
]

const UsersTab = ({isStreamer}) => {


    const classes = useStyles()
    const {currentLivestream: {talentPool}} = useCurrentStream()

    const [searchParams, setSearchParams] = useState("");
    const [currentOption, setCurrentOption] = useState(options[0]);

    const handleFilter = (arrayOfUserObjects) => {
        let filtered = arrayOfUserObjects.filter(user =>
            user.firstName?.toLowerCase().includes(searchParams)
            || user.lastName?.toLowerCase().includes(searchParams)
            || user.universityName?.toLowerCase().includes(searchParams)
        )
        if (currentOption === TALENT_POOL_OPTION) {
            filtered = filtered.filter(user => talentPool?.includes(user.id))
        }
        return filtered.map(user => ({...user, inTalentPool: talentPool?.includes(user.id)}))
    }

    const audience = useSelector(({firestore: {ordered: {audience}}}) => audience && handleFilter(audience) || [])

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
                <Grid item xs={isStreamer ? 10 : 12}>
                    <TextField
                        fullWidth
                        value={searchParams}
                        onChange={handleSearch}
                        label="Search for people..."
                    />
                </Grid>
                {isStreamer &&
                <Grid item xs={2}>
                    <FormControl fullWidth>
                        <InputLabel id="audience-select">filter:</InputLabel>
                        <Select
                            labelId="audience-select"
                            id="audience-select"
                            value={currentOption}
                            onChange={handleFilterOptions}
                        >
                            {options.map(option => <MenuItem value={option}>{option}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>}
            </Grid>
            <UserList isStreamer={isStreamer} audience={audience}/>
        </Fragment>
    );
};

UsersTab.propTypes = {
    isStreamer: PropTypes.bool.isRequired
}

export default UsersTab;

