import React, {useState} from 'react';
import {
    Box,
    Button,
    Card,
    CardMedia,
    Collapse,
    FormControl,
    FormHelperText,
    FormLabel,
    Typography
} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import Autocomplete from "@material-ui/lab/Autocomplete";
import {uploadLogo} from "../../../helperFunctions/HelperFunctions";
import FilePickerContainer from "../../../ssr/FilePickerContainer";
import {makeStyles} from "@material-ui/core/styles";

const placeholder = "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/random-logos%2Fimage-placeholder.jpg?alt=media&token=760615d8-dfac-40f3-87b2-e8af315b5995"

const useStyles = makeStyles((theme) => ({
    media: {
        display: "flex",
        justifyContent: "center",
        height: 200,
        width: "100%",
        borderRadius: 4,

        // marginBottom: theme.spacing(2)
    },
    image: {
        objectFit: "contain",
        width: "100%",
        borderRadius: 4,
        // maxWidth: "80%",
    },
    inputRoot: {
        paddingRight: 9,
    },
    input: {
        "& .MuiInputBase-input": {
            cursor: "pointer",
        },
        "& .MuiInputBase-root": {
            padding: "9px !important"
        }
    },

}));

const ImageSelect =
    ({
         options,
         firebase,
         error,
         value,
         formName,
         label,
         loading,
         values,
         submitting,
         handleBlur,
         getDownloadUrl,
         setFieldValue,
         path
     }) => {

        const classes = useStyles()
        const [open, setOpen] = useState(false);
        const [filePickerError, setFilePickerError] = useState(null)

        const getSelectedItem = () => {// Autocomplete will always complain because of async filtering... :( So ignore the warning
            const item = options.find((option) => option.value === value)
            // console.log("-> item", item);
            if (item) {
                return item
            } else {
                return {}
            }
        }

        const handleSelect = (event, value) => {
            const actualValue = value ? value.value : ""
            setFieldValue(formName, actualValue, true);
        }

        const renderImage = (
            <Box boxShadow={2} component={CardMedia} className={classes.media}>
                <img src={value.length ? value : placeholder}
                     className={classes.image}
                     alt={formName}/>
            </Box>
        )


        return options.length ? (
            <>
                <Autocomplete
                    id={formName}
                    name={formName}
                    disabled={submitting}
                    selectOnFocus
                    onBlur={handleBlur}
                    autoHighlight
                    fullWidth
                    onChange={handleSelect}
                    open={open}
                    onOpen={() => {
                        setOpen(true);
                    }}
                    onClose={() => {
                        setOpen(false);
                    }}
                    getOptionLabel={(option) => option.text || ""}
                    value={getSelectedItem()}
                    getOptionSelected={(option, value) => option.value === value.value || true}
                    options={options}
                    loading={loading}
                    renderInput={(params) => (
                        <FormControl disabled={submitting} error={Boolean(error)} fullWidth>
                            <TextField
                                {...params}
                                error={Boolean(error)}
                                id={formName}
                                className={classes.input}
                                name={formName}
                                onBlur={handleBlur}
                                label={`Chose a ${label}`}
                                disabled={submitting}
                                variant="outlined"
                                InputProps={{
                                    root: classes.inputRoot,
                                    ...params.InputProps,
                                    endAdornment: (
                                        <React.Fragment>
                                            {loading ? <CircularProgress color="inherit" size={20}/> : null}
                                            {params.InputProps.endAdornment}
                                            {renderImage}
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
                        const matches = match(option.text, inputValue);
                        const parts = parse(option.text, matches);
                        return (<div>
                                {parts.map((part, index) => (
                                    <span key={index}
                                          style={{fontWeight: part.highlight ? 700 : 400}}>{part.text}</span>))}
                            </div>
                        );
                    }}
                />
                <FilePickerContainer
                    extensions={['jpg', 'jpeg', 'png']}
                    maxSize={20}
                    onError={errMsg => (setFilePickerError(errMsg))}
                    onChange={fileObject => {
                        uploadLogo(path, fileObject, firebase, (newUrl, fullPath) => {
                            setFieldValue(formName, getDownloadUrl(fullPath), true);
                            setFilePickerError(null)
                        })
                    }}
                >
                    <Button fullWidth style={{marginTop: "0.5rem"}} variant="contained" id='upButton'>
                        {`-OR - Upload`}</Button>
                </FilePickerContainer>
                <Collapse in={Boolean(filePickerError)}>
                    <FormHelperText error>{filePickerError}</FormHelperText>
                </Collapse>
            </>
        ) : null
    };

export default ImageSelect;
