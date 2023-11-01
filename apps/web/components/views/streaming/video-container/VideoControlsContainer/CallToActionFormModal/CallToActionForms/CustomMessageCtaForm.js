const { memo } = require("react")
import { Collapse, Grid, TextField } from "@mui/material"

const CustomMessageCtaForm = memo(
   ({ formik, maxMessageLength, maxButtonTextLength, onEntered, onExited }) => {
      return (
         <Grid container spacing={3}>
            <Grid xs={12} item>
               <Collapse
                  onEntered={onEntered}
                  onExited={onExited}
                  unmountOnExit
                  in={true}
               >
                  <TextField
                     fullWidth
                     variant="outlined"
                     id="message"
                     name="message"
                     disabled={formik.isSubmitting}
                     multiline
                     autoFocus
                     minRows={3}
                     maxRows={12}
                     inputProps={{
                        maxLength: maxMessageLength,
                     }}
                     placeholder="Write your message here"
                     label={"message"}
                     value={formik.values.message}
                     onChange={formik.handleChange}
                     error={
                        formik.touched.message && Boolean(formik.errors.message)
                     }
                     helperText={
                        formik.touched.message && formik.errors.message
                     }
                  />
               </Collapse>
            </Grid>
            <Grid xs={12} item>
               <Collapse unmountOnExit in={true}>
                  <TextField
                     fullWidth
                     variant="outlined"
                     disabled={formik.isSubmitting}
                     id="buttonText"
                     inputProps={{
                        maxLength: maxButtonTextLength,
                     }}
                     placeholder="Click Here"
                     name="buttonText"
                     label="Button Text*"
                     value={formik.values.buttonText}
                     onChange={formik.handleChange}
                     error={
                        formik.touched.buttonText &&
                        Boolean(formik.errors.buttonText)
                     }
                     helperText={
                        formik.touched.buttonText && formik.errors.buttonText
                     }
                  />
               </Collapse>
            </Grid>
            <Grid xs={12} sm={12} item>
               <TextField
                  fullWidth
                  variant="outlined"
                  id="buttonUrl"
                  name="buttonUrl"
                  disabled={formik.isSubmitting}
                  placeholder="https://mywebsite.com/careers/"
                  label={`Custom message Url*`}
                  value={formik.values.buttonUrl}
                  onChange={formik.handleChange}
                  error={
                     formik.touched.buttonUrl &&
                     Boolean(formik.errors.buttonUrl)
                  }
                  helperText={
                     formik.touched.buttonUrl && formik.errors.buttonUrl
                  }
               />
            </Grid>
         </Grid>
      )
   }
)

CustomMessageCtaForm.displayName = "CustomMessageCtaForm"

export default CustomMessageCtaForm
