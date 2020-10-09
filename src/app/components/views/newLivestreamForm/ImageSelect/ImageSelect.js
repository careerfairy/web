import React, {useState} from 'react';
import {Collapse, FormControl, FormHelperText} from "@material-ui/core";
import {FilePicker} from 'react-file-picker';
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import Autocomplete from "@material-ui/lab/Autocomplete";

const ImageSelect =
    ({
         options,
         currentImageUrl,
         setCurrentImageUrl,
         getDownloadUrl,
         error,
         formName,
         loading,
         submitting,
         handleBlur,
        setFieldValue
     }) => {

        const [open, setOpen] = useState(false);

        const getSelectedItem = () => {// Autocomplete will always complain because of async filtering... :( So ignore the warning
            const item = options.find((uni) => uni.id === values.university)
            return item || {}
        }

        const handleSelect = (event, value) => {
            setFieldValue(formName, value, true);
            setCurrentImageUrl(getDownloadUrl(value));
        }


        return (
            <FormControl>
                <Autocomplete
                    id="university"
                    name="university"
                    fullWidth
                    disabled={submitting}
                    selectOnFocus
                    onBlur={handleBlur}
                    autoHighlight
                    onChange={(e, value) => {
                        if (value) {
                            setFieldValue("university", value.id)
                        }
                    }}
                    open={open}
                    onOpen={() => {
                        setOpen(true);
                    }}
                    onClose={() => {
                        setOpen(false);
                    }}
                    getOptionLabel={(option) => option.name || ""}
                    value={getSelectedItem()}
                    getOptionSelected={(option, value) => option.id === value.id}
                    options={universities}
                    loading={loading}
                    renderInput={(params) => (
                        <FormControl error={Boolean(error)} fullWidth>
                            <TextField
                                {...params}
                                error={Boolean(error)}
                                id="university"
                                name="university"
                                onBlur={handleBlur}
                                label="University"
                                disabled={submitting}
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
                            <Collapse in={Boolean(error)}>
                                <FormHelperText error>
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
                                    <span key={index}
                                          style={{fontWeight: part.highlight ? 700 : 400}}>{part.text}</span>))}
                            </div>
                        );
                    }}
                />
                <label>Company Logo</label>
                <div className={formName}>
                    <img alt={formName} src={currentImageUrl}/>
                </div>
                <Dropdown placeholder='Select Company Logo' value={values.logoUrl} onChange={(event, {value}) => {
                    setFieldValue('logoUrl', value, true);
                    setCurrentLogoUrl(getDownloadUrl(value));
                }} compact selection options={options}/>
                <FilePicker
                    extensions={['jpg', 'jpeg', 'png']}
                    maxSize={20}
                    onChange={fileObject => {
                        uploadLogo('company-logos', fileObject, (newUrl, fullPath) => {
                            debugger;
                            setFieldValue('logoUrl', fullPath, true);
                            setCurrentLogoUrl(newUrl);
                        })
                    }}
                    onError={errMsg => (console.log(errMsg))}
                >
                    <Button id='upButton'>- OR - Upload New Logo</Button>
                </FilePicker>

            </FormControl>
        )
            ;
    };

export default ImageSelect;
