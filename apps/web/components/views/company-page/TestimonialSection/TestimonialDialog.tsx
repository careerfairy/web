import { useCompanyPage } from "../index"
import { useSnackbar } from "notistack"
import { useFirebaseService } from "../../../../context/firebase/FirebaseServiceContext"
import React, { Fragment, useCallback, useMemo } from "react"
import { Box, Button, Fab } from "@mui/material"
import { Formik, FormikErrors, FormikValues } from "formik"
import { Testimonial } from "@careerfairy/shared-lib/groups"
import { sxStyles } from "../../../../types/commonTypes"
import {
   buildTestimonialsArray,
   getDownloadUrl,
   handleAddSection,
   handleDeleteSection,
   handleErrorSection,
} from "../../../helperFunctions/streamFormFunctions"
import TestimonialForm from "./TestimonialForm"
import { v4 as uuidv4 } from "uuid"
import DeleteIcon from "@mui/icons-material/Delete"
import useIsMobile from "../../../custom-hook/useIsMobile"
import { GENERAL_ERROR } from "components/util/constants"

const styles = sxStyles({
   multiline: {
      minHeight: "150px",

      "& fieldset": {
         minHeight: "150px",
         textAlign: "start",
      },
   },
   addSpeaker: {
      borderRadius: "10px",
      height: (theme) => theme.spacing(10),
      border: "dashed",
      borderColor: (theme) => theme.palette.grey.A400,
      fontSize: "16px",

      "&:hover": {
         border: "dashed",
      },
   },
   deleteIcon: {
      display: "flex",
      justifyContent: "end",
      mt: 8,
   },
})

type Props = {
   handleClose: () => void
   testimonialToEdit?: Testimonial
}

const testimonialObj = {
   name: "",
   position: "",
   testimonial: "",
   avatar: "",
} as Testimonial

const TESTIMONIAL_LIMIT = 10

const TestimonialDialog = ({ handleClose, testimonialToEdit }: Props) => {
   const { group, updateGroup } = useCompanyPage()
   const firebaseService = useFirebaseService()
   const { enqueueSnackbar } = useSnackbar()
   const isMobile = useIsMobile()

   const initialValues = useMemo(
      () => ({
         testimonials: testimonialToEdit
            ? [testimonialToEdit]
            : { [uuidv4()]: testimonialObj },
      }),
      [testimonialToEdit]
   )

   const handleSubmitForm = useCallback(
      async (values) => {
         try {
            let testimonialsToUpdate = [
               ...group.testimonials,
               ...buildTestimonialsArray(values, group.id),
            ]

            if (testimonialToEdit) {
               // TODO update testimonial
               // testimonialsToUpdate = [
               //    ...group.testimonials,
               // ]
            }
            await firebaseService.updateCareerCenter(group.id, {
               testimonials: testimonialsToUpdate,
            })
            updateGroup()
            handleClose()
         } catch (e) {
            console.log("error", e)
            enqueueSnackbar(GENERAL_ERROR, {
               variant: "error",
               preventDuplicate: true,
            })
         }
      },
      [
         enqueueSnackbar,
         firebaseService,
         group.id,
         group.testimonials,
         handleClose,
         testimonialToEdit,
         updateGroup,
      ]
   )
   return (
      <Box>
         <Formik
            initialValues={initialValues}
            validate={handleValidation}
            onSubmit={handleSubmitForm}
         >
            {({
               values,
               errors,
               touched,
               handleBlur,
               handleSubmit,
               isSubmitting,
               setFieldValue,
               setValues,
            }) => (
               <form onSubmit={handleSubmit}>
                  {Object.keys(values.testimonials).map((key, index) => (
                     <Fragment key={key}>
                        {!!index && (
                           <Box sx={styles.deleteIcon}>
                              <Fab
                                 size="small"
                                 color="secondary"
                                 onClick={() =>
                                    handleDeleteSection(
                                       "testimonials",
                                       key,
                                       values,
                                       setValues
                                    )
                                 }
                              >
                                 <DeleteIcon />
                              </Fab>
                           </Box>
                        )}
                        <TestimonialForm
                           testimonialError={handleErrorSection(
                              "testimonials",
                              key,
                              "testimonial",
                              errors,
                              touched
                           )}
                           nameError={handleErrorSection(
                              "testimonials",
                              key,
                              "name",
                              errors,
                              touched
                           )}
                           positionError={handleErrorSection(
                              "testimonials",
                              key,
                              "position",
                              errors,
                              touched
                           )}
                           avatarError={handleErrorSection(
                              "testimonials",
                              key,
                              "avatar",
                              errors,
                              touched
                           )}
                           testimonial={values.testimonials[key]}
                           objectKey={key}
                           setFieldValue={setFieldValue}
                           handleBlur={handleBlur}
                           isSubmitting={isSubmitting}
                           getDownloadUrl={getDownloadUrl}
                           setValues={setValues}
                           index={index}
                           values={values}
                           handleAddTestimonial={handleAddSection}
                           testimonialObj={testimonialObj}
                           testimonialsLimit={TESTIMONIAL_LIMIT}
                           disabledAddMoreTestimonials={!!testimonialToEdit}
                        />
                     </Fragment>
                  ))}
                  <Box display="flex" justifyContent="end" mt={4}>
                     <Button
                        type={"submit"}
                        variant="contained"
                        color="secondary"
                        disabled={isSubmitting}
                        size={isMobile ? "small" : "large"}
                     >
                        Save & Close
                     </Button>
                  </Box>
               </form>
            )}
         </Formik>
      </Box>
   )
}

const handleValidation = (values: FormikValues) => {
   let errors: FormikErrors<FormikValues> = {
      testimonials: {},
   }
   const minDescCharLength = 10

   Object.keys(values.testimonials).forEach((key) => {
      errors.testimonials[key] = {}

      if (!values.testimonials[key].testimonial) {
         errors.testimonials[key].testimonial = "Please fill"
      } else if (
         values.testimonials[key].testimonial.length < minDescCharLength
      ) {
         errors.testimonials[
            key
         ].testimonial = `Must be at least ${minDescCharLength} characters`
      }

      if (!values.testimonials[key].name) {
         errors.testimonials[key].name = "Please add the name"
      }
      if (!values.testimonials[key].position) {
         errors.testimonials[key].position = "Please add the position"
      }
      if (!values.testimonials[key].avatar) {
         errors.testimonials[key].avatar = "Please add the avatar"
      }
      if (!Object.keys(errors.testimonials[key]).length) {
         delete errors.testimonials[key]
      }
   })

   if (!Object.keys(errors.testimonials).length) {
      delete errors.testimonials
   }

   return errors
}

export default TestimonialDialog
