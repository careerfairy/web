import React, { Fragment, useEffect, useState } from "react"
import ImageSelect from "../ImageSelect/ImageSelect"
import { FormControl, Collapse, Grid, TextField, Button } from "@mui/material"
import makeStyles from "@mui/styles/makeStyles"
import PersonAddIcon from "@mui/icons-material/PersonAdd"

const useStyles = makeStyles((theme) => ({
   formGrid: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      "& .MuiFormControl-root:not(:last-child)": {
         marginBottom: theme.spacing(3.3),
      },
   },
   formGroup: {
      background: "white",
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3),
   },
}))
const SpeakerForm = ({
   options,
   firstNameError,
   lastNameError,
   positionError,
   backgroundError,
   firebase,
   speaker,
   objectKey,
   setFieldValue,
   handleBlur,
   isSubmitting,
   loading,
   getDownloadUrl,
   setValues,
   index,
   values,
   handleAddSpeaker,
   speakerObj,
}) => {
   const classes = useStyles()

   const [animate, setAnimate] = useState(false)
   useEffect(() => {
      setAnimate(true)
   }, [])

   const isLast = index === Object.keys(values.speakers).length - 1

   return (
      <Fragment>
         <Collapse
            in={animate}
            component={Grid}
            className={classes.formGrid}
            xs={12}
            sm={12}
            md={12}
            lg={6}
            xl={6}
            item
         >
            <FormControl fullWidth>
               <TextField
                  name={`speakers.${objectKey}.firstName`}
                  id={`speakers.${objectKey}.firstName`}
                  variant="outlined"
                  fullWidth
                  disabled={isSubmitting}
                  style={{ marginBottom: 0 }}
                  onBlur={handleBlur}
                  label="First Name"
                  inputProps={{ maxLength: 70 }}
                  value={speaker.firstName}
                  error={Boolean(firstNameError)}
                  onChange={({ currentTarget: { value } }) =>
                     setFieldValue(`speakers.${objectKey}.firstName`, value)
                  }
               />
               <Collapse in={Boolean(firstNameError)} style={{ color: "red" }}>
                  {firstNameError}
               </Collapse>
            </FormControl>
            <FormControl fullWidth>
               <TextField
                  name={`speakers.${objectKey}.lastName`}
                  id={`speakers.${objectKey}.lastName`}
                  variant="outlined"
                  fullWidth
                  disabled={isSubmitting}
                  style={{ marginBottom: 0 }}
                  onBlur={handleBlur}
                  label="Last Name"
                  inputProps={{ maxLength: 70 }}
                  value={speaker.lastName}
                  error={Boolean(lastNameError)}
                  onChange={({ currentTarget: { value } }) =>
                     setFieldValue(`speakers.${objectKey}.lastName`, value)
                  }
               />
               <Collapse in={Boolean(lastNameError)} style={{ color: "red" }}>
                  {lastNameError}
               </Collapse>
            </FormControl>
            <FormControl fullWidth>
               <TextField
                  name={`speakers.${objectKey}.position`}
                  id={`speakers.${objectKey}.position`}
                  variant="outlined"
                  fullWidth
                  disabled={isSubmitting}
                  onBlur={handleBlur}
                  label="Position"
                  style={{ marginBottom: 0 }}
                  inputProps={{ maxLength: 70 }}
                  value={speaker.position}
                  error={Boolean(positionError)}
                  onChange={({ currentTarget: { value } }) =>
                     setFieldValue(`speakers.${objectKey}.position`, value)
                  }
               />
               <Collapse in={Boolean(positionError)} style={{ color: "red" }}>
                  {positionError}
               </Collapse>
            </FormControl>
            <FormControl fullWidth>
               <TextField
                  name={`speakers.${objectKey}.background`}
                  id={`speakers.${objectKey}.background`}
                  variant="outlined"
                  fullWidth
                  disabled={isSubmitting}
                  onBlur={handleBlur}
                  label="Background"
                  style={{ marginBottom: 0 }}
                  inputProps={{ maxLength: 200 }}
                  value={speaker.background}
                  error={Boolean(backgroundError)}
                  onChange={({ currentTarget: { value } }) =>
                     setFieldValue(`speakers.${objectKey}.background`, value)
                  }
               />
               <Collapse in={Boolean(backgroundError)} style={{ color: "red" }}>
                  {backgroundError}
               </Collapse>
            </FormControl>
         </Collapse>
         <Collapse
            in={animate}
            component={Grid}
            xs={12}
            sm={12}
            md={12}
            lg={6}
            xl={6}
            item
         >
            <ImageSelect
               path="mentors-pictures"
               getDownloadUrl={getDownloadUrl}
               formName={`speakers.${objectKey}.avatar`}
               label="Speaker Avatar"
               error={false}
               handleBlur={handleBlur}
               isSubmitting={isSubmitting}
               loading={loading}
               options={options}
               value={speaker.avatar}
               isAvatar
               firebase={firebase}
               setFieldValue={setFieldValue}
            />
         </Collapse>
         {isLast ? (
            <Grid xs={12} sm={12} md={12} lg={12} xl={12} item>
               <Button
                  startIcon={<PersonAddIcon />}
                  disabled={
                     Object.keys(values.speakers).length >= 3 || isSubmitting
                  }
                  onClick={() =>
                     handleAddSpeaker("speakers", values, setValues, speakerObj)
                  }
                  type="button"
                  color="primary"
                  variant="contained"
                  fullWidth
               >
                  {Object.keys(values.speakers).length >= 3
                     ? "3 Speakers Maximum"
                     : "Add a Speaker"}
               </Button>
            </Grid>
         ) : null}
      </Fragment>
   )
}

export default SpeakerForm
