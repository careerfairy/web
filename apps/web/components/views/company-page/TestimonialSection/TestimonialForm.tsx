import { sxStyles } from "../../../../types/commonTypes"
import {
   Button,
   Collapse,
   Grid,
   Stack,
   TextField,
   Typography,
} from "@mui/material"
import ImageSelect from "../../draftStreamForm/ImageSelect/ImageSelect"
import { UserPlus } from "react-feather"
import { Testimonial } from "@careerfairy/shared-lib/dist/groups"
import { FormikValues } from "formik"
import CustomRichTextEditor from "components/util/CustomRichTextEditor"
import { useRef } from "react"

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
})

type Props = {
   testimonialError: string
   nameError: string
   positionError: string
   avatarError: string
   testimonial: Testimonial
   objectKey: string
   setFieldValue: (field, value) => void
   handleBlur: (event) => void
   handleChange: (event) => void
   isSubmitting: boolean
   getDownloadUrl: (fileName) => string
   setValues: (values) => void
   index: number
   values: FormikValues
   handleAddTestimonial: (objName, values, setValues, obj) => void
   testimonialObj: Testimonial
   testimonialsLimit: number
   disabledAddMoreTestimonials?: boolean
}

const TestimonialForm = ({
   testimonialError,
   nameError,
   positionError,
   avatarError,
   testimonial,
   objectKey,
   setFieldValue,
   handleBlur,
   handleChange,
   isSubmitting,
   getDownloadUrl,
   setValues,
   index,
   values,
   handleAddTestimonial,
   testimonialObj,
   testimonialsLimit,
   disabledAddMoreTestimonials,
}: Props) => {
   const isLast = index === Object.keys(values.testimonials).length - 1
   testimonial.quillInputRef = useRef()

   return (
      <>
         <Grid container>
            <Grid item xs={12} md={4}>
               <ImageSelect
                  path="testimonial-avatars"
                  getDownloadUrl={getDownloadUrl}
                  formName={`testimonials.${objectKey}.avatar`}
                  label="Avatar"
                  error={Boolean(avatarError)}
                  isSubmitting={isSubmitting}
                  value={testimonial.avatar}
                  isAvatar
                  setFieldValue={setFieldValue}
                  showIconButton={false}
                  isButtonOutlined={false}
                  buttonCentered={true}
               />
            </Grid>
            <Grid item xs={12} md={8} mt={4}>
               <Stack spacing={{ xs: 1, md: 2 }}>
                  <Grid item xs={12}>
                     <TextField
                        fullWidth
                        multiline
                        label="Testimonial"
                        name={`testimonials.${objectKey}.testimonial`}
                        id={`testimonials.${objectKey}.testimonial`}
                        placeholder="Say something about their story"
                        disabled={isSubmitting}
                        onChange={handleChange}
                        error={Boolean(testimonialError)}
                        value={testimonial.testimonial ? testimonial.testimonial : "<p></p>"} //to avoid label getting on top of editor when empty
                        variant="outlined"
                        sx={styles.multiline}
                        inputRef={testimonial.quillInputRef}
                        InputProps={{
                           // eslint-disable-next-line @typescript-eslint/no-explicit-any
                           inputComponent: CustomRichTextEditor as any,
                        }}
                     />
                     <Collapse
                        in={Boolean(testimonialError)}
                        style={{ color: "red" }}
                     >
                        {testimonialError}
                     </Collapse>
                  </Grid>
                  <Grid container xs={12} rowSpacing={2}>
                     <Grid item xs={12} md={6} pr={{ md: 1 }}>
                        <TextField
                           name={`testimonials.${objectKey}.name`}
                           id={`testimonials.${objectKey}.name`}
                           placeholder="Enter their full name"
                           variant="outlined"
                           fullWidth
                           disabled={isSubmitting}
                           onBlur={handleBlur}
                           label="Name"
                           inputProps={{ maxLength: 70 }}
                           value={testimonial.name}
                           error={Boolean(nameError)}
                           onChange={({ currentTarget: { value } }) =>
                              setFieldValue(
                                 `testimonials.${objectKey}.name`,
                                 value
                              )
                           }
                        />
                        <Collapse
                           in={Boolean(nameError)}
                           style={{ color: "red" }}
                        >
                           {nameError}
                        </Collapse>
                     </Grid>
                     <Grid item xs={12} md={6} pl={{ md: 1 }}>
                        <TextField
                           name={`testimonials.${objectKey}.position`}
                           id={`testimonials.${objectKey}.position`}
                           placeholder="Enter the speaker’s position"
                           variant="outlined"
                           fullWidth
                           disabled={isSubmitting}
                           onBlur={handleBlur}
                           label="Position"
                           value={testimonial.position}
                           inputProps={{ maxLength: 70 }}
                           error={Boolean(positionError)}
                           onChange={({ currentTarget: { value } }) =>
                              setFieldValue(
                                 `testimonials.${objectKey}.position`,
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
                  </Grid>
               </Stack>
            </Grid>
            {isLast && !disabledAddMoreTestimonials ? (
               <Grid xs={12} mt={4} item>
                  <Button
                     startIcon={<UserPlus size={"28"} />}
                     disabled={
                        Object.keys(values.testimonials).length >=
                           testimonialsLimit || isSubmitting
                     }
                     onClick={() =>
                        handleAddTestimonial(
                           "testimonials",
                           values,
                           setValues,
                           testimonialObj
                        )
                     }
                     type="button"
                     color="secondary"
                     variant="outlined"
                     sx={styles.addSpeaker}
                     size="large"
                     fullWidth
                  >
                     <Typography variant="h6" ml={1}>
                        {Object.keys(values.testimonials).length >=
                        testimonialsLimit
                           ? `${testimonialsLimit} Testimonials Maximum`
                           : "Add a Testimonial"}
                     </Typography>
                  </Button>
               </Grid>
            ) : null}
         </Grid>
      </>
   )
}

export default TestimonialForm
