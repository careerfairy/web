import React, { useEffect, useState } from "react"
import ImageSelect from "../ImageSelect/ImageSelect"
import { Collapse, Grid, TextField, Button } from "@mui/material"
import makeStyles from "@mui/styles/makeStyles"
import PersonAddIcon from "@mui/icons-material/PersonAdd"

const useStyles = makeStyles((theme) => ({
   formGrid: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
   },
   addButton: {
      marginTop: theme.spacing(4),
   },
   addSpeaker: {
      borderRadius: "10px",
      height: theme.spacing(10),
      border: "dashed",
      borderColor: theme.palette.grey.A400,

      "&:hover": {
         border: "dashed",
      },
   },
}))
const SpeakerForm = ({
   firstNameError,
   lastNameError,
   positionError,
   backgroundError,
   avatarError,
   emailError,
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
   speakerLimit,
}) => {
   const classes = useStyles()

   const [animate, setAnimate] = useState(false)
   useEffect(() => {
      setAnimate(true)
   }, [])

   const isLast = index === Object.keys(values.speakers).length - 1

   return (
      <>
         <Grid container>
            <Collapse in={animate} component={Grid} xs={12} md={3} item>
               <ImageSelect
                  path="mentors-pictures"
                  getDownloadUrl={getDownloadUrl}
                  formName={`speakers.${objectKey}.avatar`}
                  label="Avatar"
                  error={Boolean(avatarError)}
                  handleBlur={handleBlur}
                  isSubmitting={isSubmitting}
                  loading={loading}
                  value={speaker.avatar}
                  isAvatar
                  firebase={firebase}
                  setFieldValue={setFieldValue}
                  showIconButton={false}
                  isButtonOutlined={false}
                  buttonCentered={true}
               />
            </Collapse>

            <Collapse
               in={animate}
               component={Grid}
               className={classes.formGrid}
               xs={12}
               md={9}
               item
               id={objectKey}
            >
               <Grid container spacing={2} mt={{ xs: 2, md: "unset" }}>
                  <Grid xs={12} lg={6} item>
                     <TextField
                        name={`speakers.${objectKey}.firstName`}
                        id={`speakers.${objectKey}.firstName`}
                        placeholder="Enter the speaker’s first name"
                        variant="outlined"
                        fullWidth
                        disabled={isSubmitting}
                        onBlur={handleBlur}
                        label="First Name"
                        inputProps={{ maxLength: 70 }}
                        value={speaker.firstName}
                        error={Boolean(firstNameError)}
                        onChange={({ currentTarget: { value } }) =>
                           setFieldValue(
                              `speakers.${objectKey}.firstName`,
                              value
                           )
                        }
                     />
                     <Collapse
                        in={Boolean(firstNameError)}
                        style={{ color: "red" }}
                     >
                        {firstNameError}
                     </Collapse>
                  </Grid>
                  <Grid xs={12} lg={6} item>
                     <TextField
                        name={`speakers.${objectKey}.lastName`}
                        id={`speakers.${objectKey}.lastName`}
                        placeholder="Enter the speaker’s last name"
                        variant="outlined"
                        fullWidth
                        disabled={isSubmitting}
                        onBlur={handleBlur}
                        label="Last Name"
                        inputProps={{ maxLength: 70 }}
                        value={speaker.lastName}
                        error={Boolean(lastNameError)}
                        onChange={({ currentTarget: { value } }) =>
                           setFieldValue(
                              `speakers.${objectKey}.lastName`,
                              value
                           )
                        }
                     />
                     <Collapse
                        in={Boolean(lastNameError)}
                        style={{ color: "red" }}
                     >
                        {lastNameError}
                     </Collapse>
                  </Grid>
                  <Grid xs={12} lg={6} item>
                     <TextField
                        name={`speakers.${objectKey}.position`}
                        id={`speakers.${objectKey}.position`}
                        placeholder="Enter the speaker’s position"
                        variant="outlined"
                        fullWidth
                        disabled={isSubmitting}
                        onBlur={handleBlur}
                        label="Position"
                        inputProps={{ maxLength: 70 }}
                        value={speaker.position}
                        error={Boolean(positionError)}
                        onChange={({ currentTarget: { value } }) =>
                           setFieldValue(
                              `speakers.${objectKey}.position`,
                              value
                           )
                        }
                     />
                     <Collapse
                        in={Boolean(positionError)}
                        style={{ color: "red" }}
                     >
                        {positionError}
                     </Collapse>
                  </Grid>

                  <Grid xs={12} lg={6} item>
                     <TextField
                        name={`speakers.${objectKey}.background`}
                        id={`speakers.${objectKey}.background`}
                        placeholder="Enter the speaker’s academic background"
                        variant="outlined"
                        fullWidth
                        multiline
                        disabled={isSubmitting}
                        onBlur={handleBlur}
                        label="Background"
                        style={{ marginBottom: 0 }}
                        inputProps={{ maxLength: 200 }}
                        value={speaker.background}
                        error={Boolean(backgroundError)}
                        onChange={({ currentTarget: { value } }) =>
                           setFieldValue(
                              `speakers.${objectKey}.background`,
                              value
                           )
                        }
                     />
                     <Collapse
                        in={Boolean(backgroundError)}
                        style={{ color: "red" }}
                     >
                        {backgroundError}
                     </Collapse>
                  </Grid>
                  <Grid xs={12} item>
                     <TextField
                        name={`speakers.${objectKey}.email`}
                        id={`speakers.${objectKey}.email`}
                        placeholder="Enter the speaker’s email address"
                        variant="outlined"
                        fullWidth
                        disabled={isSubmitting}
                        onBlur={handleBlur}
                        label="Email Address"
                        inputProps={{ maxLength: 70 }}
                        value={speaker.email}
                        error={Boolean(emailError)}
                        onChange={({ currentTarget: { value } }) =>
                           setFieldValue(`speakers.${objectKey}.email`, value)
                        }
                     />
                     <Collapse
                        in={Boolean(emailError)}
                        style={{ color: "red" }}
                     >
                        {emailError}
                     </Collapse>
                  </Grid>
               </Grid>
            </Collapse>
         </Grid>

         {isLast && (
            <Grid xs={12} className={classes.addButton} item>
               <Button
                  startIcon={<PersonAddIcon />}
                  disabled={
                     Object.keys(values.speakers).length >= speakerLimit ||
                     isSubmitting
                  }
                  onClick={() =>
                     handleAddSpeaker("speakers", values, setValues, speakerObj)
                  }
                  type="button"
                  color="secondary"
                  variant="outlined"
                  className={classes.addSpeaker}
                  size="large"
                  fullWidth
               >
                  {Object.keys(values.speakers).length >= speakerLimit
                     ? `${speakerLimit} Speakers Maximum`
                     : "Add a Speaker"}
               </Button>
            </Grid>
         )}
      </>
   )
}

export default SpeakerForm
