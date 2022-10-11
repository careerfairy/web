import React, { Fragment } from "react"
import { Box, Fab, Typography } from "@mui/material"
import {
   getDownloadUrl,
   handleAddSpeaker,
   handleDeleteSpeaker,
   handleError,
} from "../../../helperFunctions/streamFormFunctions"
import DeleteIcon from "@mui/icons-material/Delete"
import FormGroup from "../FormGroup"
import SpeakerForm from "../SpeakerForm/SpeakerForm"
import { useFirebaseService } from "../../../../context/firebase/FirebaseServiceContext"
import { ISpeakerObj } from "../DraftStreamForm"
import { FormikErrors, FormikTouched, FormikValues } from "formik"
import makeStyles from "@mui/styles/makeStyles"
import { createStyles } from "@mui/styles"

const useStyles = makeStyles((theme) =>
   createStyles({
      speakersHeader: {
         display: "flex",
         alignItems: "center",
         justifyContent: "space-between",
      },
   })
)

type Props = {
   values: FormikValues
   setValues: (values) => void
   speakerLimit: number
   speakerObj: ISpeakerObj
   errors: FormikErrors<FormikValues>
   touched: FormikTouched<FormikValues>
   setFieldValue: (field, value) => void
   isSubmitting: boolean
   handleBlur: (e) => void
}

const SpeakersInfo = ({
   values,
   setValues,
   speakerLimit,
   speakerObj,
   errors,
   touched,
   setFieldValue,
   isSubmitting,
   handleBlur,
}: Props) => {
   const classes = useStyles()
   const firebase = useFirebaseService()

   return (
      <>
         {Object.keys(values.speakers).map((key, index) => {
            return (
               <Fragment key={key}>
                  <Box className={classes.speakersHeader}>
                     <Box>
                        <Typography fontWeight="bold" variant="h4">
                           {index === 0
                              ? "Main Speaker"
                              : `Speaker ${index + 1}`}
                        </Typography>
                        <Typography
                           variant="subtitle1"
                           mt={1}
                           color="textSecondary"
                        >
                           {index === 0
                              ? "Details about the main speaker of the stream"
                              : `Details about the speaker ${
                                   index + 1
                                } of the stream`}
                        </Typography>
                     </Box>
                     {!!index && (
                        <Fab
                           size="small"
                           color="secondary"
                           onClick={() =>
                              handleDeleteSpeaker(key, values, setValues)
                           }
                        >
                           <DeleteIcon />
                        </Fab>
                     )}
                  </Box>
                  <FormGroup container boxShadow={0}>
                     <SpeakerForm
                        key={key}
                        speakerLimit={speakerLimit}
                        setValues={setValues}
                        speakerObj={speakerObj}
                        handleAddSpeaker={handleAddSpeaker}
                        objectKey={key}
                        index={index}
                        firstNameError={handleError(
                           key,
                           "firstName",
                           errors,
                           touched
                        )}
                        lastNameError={handleError(
                           key,
                           "lastName",
                           errors,
                           touched
                        )}
                        positionError={handleError(
                           key,
                           "position",
                           errors,
                           touched
                        )}
                        backgroundError={handleError(
                           key,
                           "background",
                           errors,
                           touched
                        )}
                        getDownloadUrl={getDownloadUrl}
                        speaker={values.speakers[key]}
                        values={values}
                        firebase={firebase}
                        setFieldValue={setFieldValue}
                        isSubmitting={isSubmitting}
                        handleBlur={handleBlur}
                        loading={false}
                        emailError={undefined}
                     />
                  </FormGroup>
               </Fragment>
            )
         })}
      </>
   )
}

export default SpeakersInfo
