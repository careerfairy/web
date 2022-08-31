import React, { useState } from "react"
import {
   Box,
   Button,
   CardMedia,
   Collapse,
   FormControl,
   FormHelperText,
   Avatar,
   TextField,
   CircularProgress,
} from "@mui/material"
import match from "autosuggest-highlight/match"
import parse from "autosuggest-highlight/parse"
import PublishIcon from "@mui/icons-material/Publish"
import Autocomplete from "@mui/material/Autocomplete"
import { uploadLogo } from "../../../helperFunctions/HelperFunctions"
import FilePickerContainer from "../../../ssr/FilePickerContainer"
import makeStyles from "@mui/styles/makeStyles"

const logoPlaceholder =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/random-logos%2Flogo-placeholder.png?alt=media&token=ef6c8d5a-af92-4b69-a946-ce78a9997382"

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
         padding: "9px !important",
      },
   },
   avaLarge: {
      width: theme.spacing(23),
      height: theme.spacing(23),
   },
}))

const ImageSelect = ({
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
   path,
   isAvatar,
   isSuperAdmin,
}) => {
   const classes = useStyles()
   const [open, setOpen] = useState(false)
   const [filePickerError, setFilePickerError] = useState(null)

   const getSelectedItem = () => {
      // Autocomplete will always complain because of async filtering... :( So ignore the warning
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
      setFieldValue(formName, actualValue, true)
   }

   const renderImage = isAvatar ? (
      <div className={classes.avaWrapper}>
         <Box
            boxShadow={3}
            component={Avatar}
            src={value}
            className={classes.avaLarge}
            alt={formName}
         />
      </div>
   ) : (
      <Box boxShadow={2} component={CardMedia} className={classes.media}>
         <img
            src={value.length ? value : logoPlaceholder}
            className={classes.image}
            alt={formName}
         />
      </Box>
   )

   return options.length ? (
      <>
         <Autocomplete
            id={formName}
            name={formName}
            disabled={isSubmitting || !isSuperAdmin}
            selectOnFocus
            onBlur={handleBlur}
            autoHighlight
            fullWidth
            onChange={handleSelect}
            open={open}
            onOpen={() => {
               setOpen(true)
            }}
            onClose={() => {
               setOpen(false)
            }}
            getOptionLabel={(option) => option.text || ""}
            // value={getSelectedItem()}
            isOptionEqualToValue={(option, value) =>
               option.value === value.value
            }
            options={options}
            loading={loading}
            renderInput={(params) => (
               <FormControl
                  disabled={isSubmitting}
                  error={Boolean(error)}
                  fullWidth
               >
                  <TextField
                     {...params}
                     error={Boolean(error)}
                     id={formName}
                     className={classes.input}
                     name={formName}
                     onBlur={handleBlur}
                     label={`Chose a ${label}`}
                     variant="outlined"
                     InputProps={{
                        root: classes.inputRoot,
                        ...params.InputProps,
                        endAdornment: (
                           <React.Fragment>
                              {loading ? (
                                 <CircularProgress color="inherit" size={20} />
                              ) : null}
                              {params.InputProps.endAdornment}
                              {renderImage}
                           </React.Fragment>
                        ),
                     }}
                  />
                  <Collapse in={Boolean(error)}>
                     <FormHelperText error>{error}</FormHelperText>
                  </Collapse>
               </FormControl>
            )}
            renderOption={(option, { inputValue }) => {
               const matches = match(option.text, inputValue)
               const parts = parse(option.text, matches)
               return (
                  <div>
                     {parts.map((part, index) => (
                        <span
                           key={index}
                           style={{ fontWeight: part.highlight ? 700 : 400 }}
                        >
                           {part.text}
                        </span>
                     ))}
                  </div>
               )
            }}
         />
         <FilePickerContainer
            extensions={["jpg", "jpeg", "png"]}
            maxSize={20}
            onError={(errMsg) => setFilePickerError(errMsg)}
            onChange={(fileObject) => {
               uploadLogo(path, fileObject, firebase, (newUrl, fullPath) => {
                  setFieldValue(formName, getDownloadUrl(fullPath), true)
                  setFilePickerError(null)
               })
            }}
         >
            <Button
               startIcon={<PublishIcon />}
               disabled={isSubmitting}
               fullWidth
               style={{ marginTop: "0.5rem" }}
               color="primary"
               variant="outlined"
               id="upButton"
            >
               {`-OR - Upload`}
            </Button>
         </FilePickerContainer>
         <Collapse in={Boolean(filePickerError)}>
            <FormHelperText error>{filePickerError}</FormHelperText>
         </Collapse>
      </>
   ) : null
}

export default ImageSelect
