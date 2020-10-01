import React from 'react';
import {FormControl, FormHelperText, InputLabel, MenuItem, Select, Collapse} from "@material-ui/core";

const UniversityCountrySelector = ({handleClose, handleOpen, open, value, handleChange, submitting, handleBlur, error}) => {
    return (
        <FormControl disabled={submitting} fullWidth variant="outlined">
            <InputLabel id="universityCountryCode">Select Country of University</InputLabel>
            <Select
                id="universityCountryCode"
                labelId="universityCountryCode"
                name="universityCountryCode"
                label="Select Country of University"
                open={open}
                variant="outlined"
                fullWidth
                error={Boolean(error)}
                disabled={submitting}
                onClose={handleClose}
                onOpen={handleOpen}
                value={value}
                onChange={handleChange}
            >
                <MenuItem value="OTHER">
                    Other
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
            <Collapse in={Boolean(error)}>
                <FormHelperText error={Boolean(error)}>
                    {error}
                </FormHelperText>
            </Collapse>
        </FormControl>
    );
};

export default UniversityCountrySelector;
