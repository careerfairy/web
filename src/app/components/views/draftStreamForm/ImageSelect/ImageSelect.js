import React, {useEffect, useState} from 'react';
import {
    Box,
    Button,
    Card,
    CardMedia,
    Collapse,
    FormControl,
    FormHelperText,
    Avatar,
    Typography
} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";
import match from "autosuggest-highlight/match";
import PublishIcon from '@material-ui/icons/Publish';
import parse from "autosuggest-highlight/parse";
import Autocomplete from "@material-ui/lab/Autocomplete";
import {uploadLogo} from "../../../helperFunctions/HelperFunctions";
import FilePickerContainer from "../../../ssr/FilePickerContainer";
import {makeStyles} from "@material-ui/core/styles";

const logoPlaceholder = "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/random-logos%2Flogo-placeholder.png?alt=media&token=ef6c8d5a-af92-4b69-a946-ce78a9997382"

const useStyles = makeStyles((theme) => ({
    media: {
        display: "flex",
        justifyContent: "center",
        borderRadius: 4,
        height: 200,
        width: "100%",
        // marginBottom: theme.spacing(2)
    },
    avaWrapper: {
        display: "grid",
        placeItems: "center",
        height: 200,
        width: "100%",
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
    avaLarge: {
        width: theme.spacing(23),
        height: theme.spacing(23),
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
         isSubmitting,
         handleBlur,
         getDownloadUrl,
         setFieldValue,
         path, isAvatar
     }) => {

        const classes = useStyles()
        const [open, setOpen] = useState(false);
        const [filePickerError, setFilePickerError] = useState(null)

        useEffect(() => {
            setFilePickerError(error)
        }, [error])

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

        const renderImage = isAvatar ? (
            <div className={classes.avaWrapper}>
                <Box boxShadow={3} component={Avatar} src={value}
                     className={classes.avaLarge}
                     alt={formName}/>
            </div>
        ) : (
            <Box p={2} boxShadow={2} component={CardMedia} className={classes.media}>
                <img src={value.length ? value : logoPlaceholder}
                     className={classes.image}
                     alt={formName}/>
            </Box>
        )


        return (<>
            {renderImage}
            <FilePickerContainer
                extensions={['jpg', 'jpeg', 'png']}
                maxSize={20}
                onError={errMsg => (setFilePickerError(errMsg))}
                onChange={fileObject => {
                    uploadLogo(path, fileObject, firebase, (newUrl, fullPath) => {
                        setFieldValue(formName, getDownloadUrl(fullPath), true);
                        setFilePickerError(null)
                    })
                }}>
                <Button startIcon={<PublishIcon/>} disabled={isSubmitting} fullWidth style={{marginTop: "0.5rem"}}
                        color={error ? "secondary" : "primary"}
                        variant="outlined" id='upButton'>
                    {value?.length ? `Change ${label}` : `Upload ${label}`}
                </Button>
            </FilePickerContainer>
            <Collapse in={Boolean(filePickerError)}>
                <FormHelperText error>{filePickerError}</FormHelperText>
            </Collapse>
        </>)
    };

export default ImageSelect;
