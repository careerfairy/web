import React from 'react';
import {FormControl, InputLabel, MenuItem, Select} from "@material-ui/core";

const UniversityCountrySelector = ({handleClose, handleOpen, open, value, handleChange}) => {
    return (
        <FormControl fullWidth variant="outlined">
            <InputLabel id="countryCode">Select Country of University</InputLabel>
            <Select
                id="countryCode"
                labelId="countryCode"
                name="countryCode"
                label="Select Country of University"
                open={open}
                variant="outlined"
                fullWidth
                onClose={handleClose}
                onOpen={handleOpen}
                value={value}
                onChange={handleChange}
            >
                <MenuItem value="">
                    <em>Other</em>
                </MenuItem>
                <MenuItem value={"CH"}>Switzerland</MenuItem>
                <MenuItem value={"AT"}>Austria</MenuItem>
                <MenuItem value={"US"}>United States</MenuItem>
                <MenuItem value={"DE"}>Germany</MenuItem>
                <MenuItem value={"ES"}>Spain</MenuItem>
                <MenuItem value={"FI"}>Finland</MenuItem>
                <MenuItem value={"FR"}>France</MenuItem>
                <MenuItem value={"GB"}>United Kingdom</MenuItem>
                <MenuItem value={"IT"}>Italy</MenuItem>
                <MenuItem value={"NL"}>Netherlands</MenuItem>
                <MenuItem value={"NO"}>Norway</MenuItem>
                <MenuItem value={"SE"}>Sweden</MenuItem>
            </Select>
        </FormControl>
    );
};

export default UniversityCountrySelector;
