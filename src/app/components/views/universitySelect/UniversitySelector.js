import React, {useEffect, useState} from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import {withFirebase} from "../../../context/firebase";
import {makeStyles} from "@material-ui/core/styles";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import {Collapse, FormControl, FormHelperText} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
    helperText: {
        position: "absolute",
        bottom: -19
    }
}))

const otherObj = {name: "other"}
const UniversitySelector = ({firebase, countryCode, setFieldValue, error, handleBlur, submitting}) => {
    const classes = useStyles()
    const [open, setOpen] = useState(false);
    const [universities, setUniversities] = useState([otherObj])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (countryCode && countryCode.length) {
            (async () => {
                try {
                    setUniversities([otherObj])
                    setLoading(true)
                    const querySnapshot = await firebase.getUniversitiesFromCountryCode(countryCode)
                    const fetchedUniversities = querySnapshot.data().universities
                    setUniversities([...fetchedUniversities, otherObj])
                    return setLoading(false)
                } catch (e) {
                    console.log("error in fetch universities", e)
                    return setLoading(false)
                }
            })()

            return () => setUniversities([otherObj])
        }
    }, [countryCode]);

    return (
        <Autocomplete
            id="universityObj"
            name="universityObj"
            fullWidth
            disabled={submitting}
            selectOnFocus
            onBlur={handleBlur}
            autoHighlight
            onChange={(e, value) => {
                const uniObj = value || null
                setFieldValue("universityObj", uniObj)
            }}
            open={open}
            onOpen={() => {
                setOpen(true);
            }}
            onClose={() => {
                setOpen(false);
            }}
            getOptionSelected={(option, value) => option.name === value.name}
            getOptionLabel={(option) => option.name || ""}
            options={universities}
            loading={loading}
            renderInput={(params) => (
                <FormControl error={Boolean(error)} fullWidth>
                    <TextField
                        {...params}
                        error={Boolean(error)}
                        id="universityObj"
                        name="universityObj"
                        label="University"
                        disabled={submitting}
                        // FormHelperTextProps={{classes: {root: classes.helperText}}}
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
                    <Collapse
                        in={Boolean(error)}>
                        <FormHelperText>
                            {error}
                        </FormHelperText>
                    </Collapse>
                </FormControl>
            )}
            renderOption={(option, {inputValue}) => {
                const matches = match(option.name, inputValue);
                const parts = parse(option.name, matches);
                return (<div>
                        {parts.map((part, index) => (
                            <span key={index} style={{fontWeight: part.highlight ? 700 : 400}}>{part.text}</span>))}
                    </div>
                );
            }}
        />
    );
}
export default withFirebase(UniversitySelector)
