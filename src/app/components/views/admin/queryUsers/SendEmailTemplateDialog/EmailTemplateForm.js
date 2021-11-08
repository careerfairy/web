import React from "react";
import { Formik } from "formik";
import {
   Box,
   Button,
   CircularProgress,
   DialogActions,
   Grid,
   Paper,
   TextField,
   Typography,
} from "@material-ui/core";
import { DateTimePicker } from "@material-ui/pickers";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch } from "react-redux";
import * as actions from "store/actions";
import DateUtil from "../../../../../util/DateUtil";

const now = new Date();

const useStyles = makeStyles((theme) => ({
   actions: {
      padding: theme.spacing(1, 0, 0, 0),
   },
   loaderWrapper: {
      display: "flex",
      position: "absolute",
      width: "90%",
      height: "90%",
      alignItems: "center",
      justifyContent: "center",
   },
}));
const EmailTemplateForm = ({
   handleClose,
   targetTemplate,
   targetStream,
   handleBack,
   emails,
}) => {
   const classes = useStyles();
   const dispatch = useDispatch();

   return (
      <Formik
         initialValues={targetTemplate.getInitialValues(targetStream)}
         enableReinitialize
         validationSchema={targetTemplate.validationSchema}
         onSubmit={async (values, { setSubmitting }) => {
            try {
               // same shape as initial values
               await targetTemplate.sendTemplate({
                  values: { ...values },
                  emails,
               });
            } catch (e) {
               dispatch(actions.sendGeneralError(e));
            }
            setSubmitting(false);
         }}
      >
         {(formik) => {
            return (
               <>
                  <Box p={1} position="relative">
                     {formik.isSubmitting && (
                        <div className={classes.loaderWrapper}>
                           <CircularProgress />
                        </div>
                     )}
                     <Box component={Paper} p={2}>
                        <Typography variant="h5" gutterBottom>
                           Finalize your template
                        </Typography>
                        <Grid container spacing={2}>
                           {targetTemplate.fields.map((field) => {
                              if (
                                 field.type === "string" ||
                                 field.type === "image"
                              ) {
                                 return (
                                    <Grid
                                       key={field.name}
                                       item
                                       xs={12}
                                       md={field.small && 6}
                                    >
                                       <TextField
                                          fullWidth
                                          variant="outlined"
                                          id={field.name}
                                          name={field.name}
                                          disabled={formik.isSubmitting}
                                          multiline={field.multiLine}
                                          minRows={field.multiLine && 3}
                                          maxRows={field.multiLine && 12}
                                          inputProps={{
                                             maxLength: field.maxLength,
                                          }}
                                          placeholder={field.placeHolder}
                                          label={field.label}
                                          onBlur={formik.handleBlur}
                                          value={formik.values[field.name]}
                                          onChange={formik.handleChange}
                                          error={
                                             formik.touched[field.name] &&
                                             Boolean(formik.errors[field.name])
                                          }
                                          helperText={
                                             formik.touched[field.name] &&
                                             formik.errors[field.name]
                                          }
                                       />
                                    </Grid>
                                 );
                              }
                              if (field.type === "date") {
                                 return (
                                    <Grid
                                       key={field.name}
                                       item
                                       xs={12}
                                       md={field.small && 6}
                                    >
                                       <DateTimePicker
                                          id={field.name}
                                          clearable
                                          disablePast
                                          label={field.label}
                                          labelFunc={(date) =>
                                             DateUtil.getRelativeDate(date)
                                          }
                                          value={formik.values[field.name]}
                                          name={field.name}
                                          onChange={(value) => {
                                             const newValue = value
                                                ? new Date(value)
                                                : null;
                                             formik.setFieldValue(
                                                field.name,
                                                newValue,
                                                true
                                             );
                                          }}
                                          disabled={formik.isSubmitting}
                                          minDate={now}
                                          inputVariant="outlined"
                                          fullWidth
                                          error={
                                             formik.touched[field.name] &&
                                             Boolean(formik.errors[field.name])
                                          }
                                          helperText={
                                             formik.touched[field.name] &&
                                             formik.errors[field.name]
                                          }
                                       />
                                    </Grid>
                                 );
                              }
                              return null;
                           })}
                        </Grid>
                        <DialogActions className={classes.actions}>
                           <Box marginRight="auto">
                              <Button
                                 onClick={handleClose}
                                 children={"Close"}
                              />
                           </Box>
                           <Button onClick={handleBack}>Back</Button>
                           <Button
                              color={"primary"}
                              variant="contained"
                              disabled={formik.isSubmitting || !formik.isValid}
                              onClick={formik.handleSubmit}
                           >
                              Finalize and Send Emails
                           </Button>
                        </DialogActions>
                     </Box>
                  </Box>
               </>
            );
         }}
      </Formik>
   );
};

export default EmailTemplateForm;
