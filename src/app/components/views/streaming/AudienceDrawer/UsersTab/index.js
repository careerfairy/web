import PropTypes from 'prop-types'
import React, {Fragment, useState} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {FormControl, Grid, InputLabel, MenuItem, Select, TextField} from "@material-ui/core";
import UserList from "./UserList";
import {useSelector} from "react-redux";
import {useCurrentStream} from "../../../../../context/stream/StreamContext";

const useStyles = makeStyles(theme => ({
    searchGridWrapper: {
        padding: theme.spacing(1, 1, 0, 1)
    }
}));

const options = [
    "All",
    "In talent pool"
]

const UsersTab = () => {


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
        if (currentOption === "In talent pool") {
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
                <Grid item xs={10}>
                    <TextField
                        fullWidth
                        value={searchParams}
                        onChange={handleSearch}
                        label="Search for people..."
                    />
                </Grid>
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
                </Grid>
            </Grid>
            <UserList audience={audience}/>
        </Fragment>
    );
};

export default UsersTab;

