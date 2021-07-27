import React, { useState } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
   Box,
   Button,
   Divider,
   Drawer,
   Grid,
   IconButton,
   TextField,
   Typography,
} from "@material-ui/core";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import * as actions from "store/actions";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import CloseIcon from "@material-ui/icons/ChevronLeft";
import clsx from "clsx";
import * as yup from "yup";
import { URL_REGEX } from "components/util/constants";

const useStyles = makeStyles((theme) => ({
   drawerContent: {
      width: 350,
      flex: 1,
      display: "flex",
      flexDirection: "column",
   },
   fullScreenDrawerContent: {
      width: "100vw",
   },
   ctaTitle: {
      fontSize: "1.5rem",
      fontWeight: 500,
      flex: 1,
   },
   headerWrapper: {
      padding: theme.spacing(3),
      display: "flex",
      width: "100%",
      alignItems: "center",
   },
   titleWrapper: {
      flex: 1,
   },
   callToActionContentWrapper: {
      padding: theme.spacing(3),
      flex: 1,
   },
}));

const MAX_BUTTON_TEXT_LENGTH = 45;
const MAX_MESSAGE_LENGTH = 1000;

const getMaxLengthError = (maxLength) => [
   maxLength,
   `This value is too long. It should have ${maxLength} characters or fewer.`,
];

const validationSchema = yup.object({
   message: yup
      .string("Enter your email")
      .max(...getMaxLengthError(MAX_MESSAGE_LENGTH)),
   buttonText: yup
      .string("Enter your password")
      .max(...getMaxLengthError(MAX_BUTTON_TEXT_LENGTH))
      .required("This value is required"),
   buttonUrl: yup
      .string("Enter your password")
      .matches(URL_REGEX, { message: "Must be a valid url" })
      .required("Must be a valid url"),
});

const Content = ({ handleClose, handleSend, loading, fullScreen }) => {
   const classes = useStyles();
   const formik = useFormik({
      initialValues: {
         message: "",
         buttonText: "",
         buttonUrl: "",
      },
      validationSchema: validationSchema,
      onSubmit: async (values) => {
         alert(JSON.stringify(values, null, 2));
         handleClose();
      },
   });

   return (
      <div
         className={clsx(classes.drawerContent, {
            [classes.fullScreenDrawerContent]: fullScreen,
         })}
      >
         <div className={classes.headerWrapper}>
            <Typography noWrap className={classes.ctaTitle} variant="h4">
               Send a call to action
            </Typography>
            <IconButton onClick={handleClose}>
               <CloseIcon />
            </IconButton>
         </div>
         <Divider />
         <div className={classes.callToActionContentWrapper}>
            <Grid
               onSubmit={formik.handleSubmit}
               container
               spacing={3}
               component="form"
            >
               <Grid xs={12} item>
                  <TextField
                     fullWidth
                     variant="outlined"
                     id="message"
                     name="message"
                     multiline
                     autoFocus
                     rows={3}
                     inputProps={{
                        maxLength: MAX_MESSAGE_LENGTH,
                     }}
                     placeholder="Click here to see our open positions"
                     label="message"
                     value={formik.values.message}
                     onChange={formik.handleChange}
                     error={
                        formik.touched.message && Boolean(formik.errors.message)
                     }
                     helperText={
                        formik.touched.message && formik.errors.message
                     }
                  />
               </Grid>
               <Grid xs={12} item>
                  <TextField
                     fullWidth
                     variant="outlined"
                     id="buttonText"
                     inputProps={{
                        maxLength: MAX_BUTTON_TEXT_LENGTH,
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
               </Grid>
               <Grid xs={12} item>
                  <TextField
                     fullWidth
                     variant="outlined"
                     id="buttonUrl"
                     name="buttonUrl"
                     placeholder="https://mywebsite.com/careers/"
                     label="Button Url*"
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
               <Grid xs={12} item>
                  <Box display="flex" justifyContent="flex-end">
                     <Button
                        type="submit"
                        disabled={loading}
                        onClick={handleSend}
                        variant="contained"
                        color="primary"
                     >
                        Send call to action
                     </Button>
                  </Box>
               </Grid>
            </Grid>
         </div>
      </div>
   );
};

Content.propTypes = {
   handleClose: PropTypes.func,
   handleSend: PropTypes.func,
   loading: PropTypes.bool,
   fullScreen: PropTypes.bool,
};
const CallToActionDrawer = ({ open, onClose }) => {
   const theme = useTheme();
   const fullScreen = useMediaQuery(theme.breakpoints.down("xs"));
   const [loading, setLoading] = useState(false);

   const dispatch = useDispatch();

   const handleClose = () => {
      onClose();
   };

   const handleSend = async () => {
      try {
         setLoading(true);
         console.log("CTA SENT!!! ;)");
      } catch (e) {
         dispatch(actions.sendGeneralError(e));
      }
      setLoading(false);
   };

   return (
      <Drawer anchor="left" open={open} onClose={handleClose}>
         <Content
            handleSend={handleSend}
            fullScreen={fullScreen}
            loading={loading}
            handleClose={handleClose}
         />
      </Drawer>
   );
};

CallToActionDrawer.propTypes = {
   onClose: PropTypes.func.isRequired,
   open: PropTypes.bool,
};

export default CallToActionDrawer;
