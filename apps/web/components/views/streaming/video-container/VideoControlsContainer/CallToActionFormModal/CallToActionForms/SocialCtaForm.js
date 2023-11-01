const { memo } = require("react")

import {
   Box,
   Collapse,
   FormControl,
   Grid,
   MenuItem,
   Select,
   TextField,
   Typography,
} from "@mui/material"
import makeStyles from "@mui/styles/makeStyles"
import { callToActionSocialsArray } from "components/util/constants/callToActions"

const useStyles = makeStyles((theme) => ({
   socialMenuItemBox: {
      "& svg": {
         marginRight: "0.5em",
      },
   },
}))

const SocialCtaForm = memo(({ formik }) => {
   const classes = useStyles()
   return (
      <Grid container spacing={3}>
         <Grid xs={12} sm={4} item>
            <Collapse unmountOnExit in={true}>
               <FormControl fullWidth variant="outlined">
                  <Select
                     value={
                        formik.values.socialData?.socialType ||
                        callToActionSocialsArray[0].socialType
                     }
                     onChange={formik.handleChange}
                     displayEmpty
                     id="socialData"
                     name="socialData.socialType"
                     inputProps={{
                        "aria-label": "Social type selector",
                     }}
                  >
                     {callToActionSocialsArray.map((social) => (
                        <MenuItem
                           key={social.socialType}
                           value={social.socialType}
                        >
                           <Box
                              display="flex"
                              flexWrap="no-wrap"
                              justifyContent="center"
                              alignItems="center"
                              height={20}
                              className={classes.socialMenuItemBox}
                           >
                              {social.icon}
                              <Typography>{social.name}</Typography>
                           </Box>
                        </MenuItem>
                     ))}
                  </Select>
               </FormControl>
            </Collapse>
         </Grid>
         <Grid xs={12} sm={8} item>
            <TextField
               fullWidth
               variant="outlined"
               id="buttonUrl"
               name="buttonUrl"
               disabled={formik.isSubmitting}
               placeholder="https://mywebsite.com/careers/"
               label={`Social Url*`}
               value={formik.values.buttonUrl}
               onChange={formik.handleChange}
               error={
                  formik.touched.buttonUrl && Boolean(formik.errors.buttonUrl)
               }
               helperText={formik.touched.buttonUrl && formik.errors.buttonUrl}
            />
         </Grid>
      </Grid>
   )
})

SocialCtaForm.displayName = "SocialCtaForm"

export default SocialCtaForm
