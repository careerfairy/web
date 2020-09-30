// *https://www.registers.service.gov.uk/registers/country/use-the-api*
import fetch from 'cross-fetch';
import React, {useEffect, useState} from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import {withFirebase} from "../../../context/firebase";

function sleep(delay = 0) {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
}

const UniversitySelector = ({firebase, countryCode, setFieldValue, setOptions, error}) => {
    const [open, setOpen] = useState(false);
    const [universities, setUniversities] = useState(["other"])
    // console.log("universities", universities);
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (countryCode && countryCode.length) {
            (async () => {
                try {
                    setUniversities(["other"])
                    setLoading(true)
                    const querySnapshot = await firebase.getUniversitiesFromCountryCode(countryCode)
                    const fetchedUniversities = querySnapshot.data().universities
                    const onlyUniNames = fetchedUniversities.map(obj => obj.name)
                    setUniversities([...new Set(onlyUniNames), ...universities]) // getting rid of any duplicate names
                    return setLoading(false)
                } catch (e) {
                    console.log("error in fetch universities", e)
                    return setLoading(false)
                }
            })()

            return () => setUniversities(["other"])
        }
    }, [countryCode]);

    useEffect(() => {
        if (!open) {
            setOptions([]);
        }
    }, [open, countryCode]);

    return (
        <Autocomplete
            id="selectedUniversity"
            name="selectedUniversity"
            fullWidth
            selectOnFocus
            autoHighlight
            onChange={(e, value) => {
                let name = value || ""
                setFieldValue("selectedUniversity", name)
            }}
            open={open}
            onOpen={() => {
                setOpen(true);
            }}
            onClose={() => {
                setOpen(false);
            }}
            getOptionSelected={(option, value) => option === value}
            getOptionLabel={(option) => option || ""}
            options={universities}
            loading={loading}
            renderInput={(params) => (
                <TextField
                    {...params}
                    error={Boolean(error)}
                    id="selectedUniversity"
                    name="selectedUniversity"
                    label="University"
                    helperText={error}
                    variant="outlined"
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {loading ? <CircularProgress color="inherit" size={20}/> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                />
            )}
        />
    );
}
export default withFirebase(UniversitySelector)
