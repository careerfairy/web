import React, {useEffect, useState} from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import {withFirebase} from "../../../context/firebase";
import {makeStyles} from "@material-ui/core/styles";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";

const useStyles = makeStyles(theme => ({
    helperText: {
        position: "absolute",
        bottom: -19
    }
}))

const UniversitySelector = ({firebase, countryCode, setFieldValue, error, handleBlur, submitting}) => {
    const classes = useStyles()
    const [open, setOpen] = useState(false);
    const [universities, setUniversities] = useState(["other"])
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
                    setUniversities(onlyUniNames)
                    return setLoading(false)
                } catch (e) {
                    console.log("error in fetch universities", e)
                    return setLoading(false)
                }
            })()

            return () => setUniversities(["other"])
        }
    }, [countryCode]);

    return (
        <Autocomplete
            id="selectedUniversity"
            name="selectedUniversity"
            fullWidth
            disabled={submitting}
            selectOnFocus
            onBlur={handleBlur}
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
                    disabled={submitting}
                    FormHelperTextProps={{classes: {root: classes.helperText}}}
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
            renderOption={(option, {inputValue}) => {
                const matches = match(option, inputValue);
                const parts = parse(option, matches);
                return (<div>
                        {parts.map((part, index) => (<span key={index} style={{fontWeight: part.highlight ? 700 : 400}}>{part.text}</span>))}
                    </div>
                );
            }}
        />
    );
}
export default withFirebase(UniversitySelector)
