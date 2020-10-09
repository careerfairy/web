import React, {useState} from 'react';
import {Button, Collapse, FormControl, FormHelperText} from "@material-ui/core";
import {FilePicker} from 'react-file-picker';
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import Autocomplete from "@material-ui/lab/Autocomplete";
import {uploadLogo} from "../../../helperFunctions/HelperFunctions";

const ImageSelect =
    ({
         options,
         currentImageUrl,
         error,
         value,
         formName,
         loading,
         submitting,
         handleBlur,
         setFieldValue
     }) => {

        const [open, setOpen] = useState(false);

        const getSelectedItem = () => {// Autocomplete will always complain because of async filtering... :( So ignore the warning
            const item = options.find((option) => option.value === value.value)
            return item || {}
        }

        const handleSelect = (event, value) => {
            setFieldValue(formName, value, true);
        }


        return (
            <>
                <div className={formName}>
                    <img alt={formName} src={currentImageUrl}/>
                </div>
                <Autocomplete
                    id={formName}
                    name={formName}
                    fullWidth
                    disabled={submitting}
                    selectOnFocus
                    onBlur={handleBlur}
                    autoHighlight
                    onChange={handleSelect}
                    open={open}
                    onOpen={() => {
                        setOpen(true);
                    }}
                    onClose={() => {
                        setOpen(false);
                    }}
                    getOptionLabel={(option) => option.name || ""}
                    value={getSelectedItem()}
                    getOptionSelected={(option, value) => option.value === value.value}
                    options={options}
                    loading={loading}
                    renderInput={(params) => (
                        <FormControl error={Boolean(error)} fullWidth>
                            <TextField
                                {...params}
                                error={Boolean(error)}
                                id={formName}
                                name={formName}
                                onBlur={handleBlur}
                                label={formName}
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
                {/*<label>Company Logo</label>*/}

                {/*<Dropdown placeholder='Select Company Logo' value={values.logoUrl} onChange={(event, {value}) => {*/}
                {/*    setFieldValue('logoUrl', value, true);*/}
                {/*    setCurrentLogoUrl(getDownloadUrl(value));*/}
                {/*}} compact selection options={options}/>*/}
                <FilePicker
                    extensions={['jpg', 'jpeg', 'png']}
                    maxSize={20}
                    onChange={fileObject => {
                        uploadLogo('company-logos', fileObject, (newUrl, fullPath) => {
                            debugger;
                            setFieldValue(formName, fullPath, true);
                        })
                    }}
                    onError={errMsg => (console.log(errMsg))}
                >
                    <Button variant="contained" id='upButton'>- OR - Upload New Logo</Button>
                </FilePicker>

            </>
        )
    };

export default ImageSelect;
