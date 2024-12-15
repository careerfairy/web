import React, { Fragment, useEffect, useRef, useState } from "react"
import { Formik } from "formik"
import { useRouter } from "next/router"
import {
   createSavedNotification,
   updateSavedNotification,
   getSavedNotification,
   NotificationData,
   NotificationResponse,
} from "../../data/firebase/PushNotificationsService"
import Button from "@mui/material/Button"
import Head from "next/head"
import AdminDashboardLayout from "../../layouts/AdminDashboardLayout"
import {
   Box,
   Grid,
   Tab,
   Tabs,
   Typography,
   Chip,
   Stack,
   IconButton,
} from "@mui/material"
import GenericDropdown from "../../components/views/common/GenericDropdown"
import { possibleGenders } from "@careerfairy/shared-lib/constants/forms"
import UniversityCountrySelector from "../../components/views/universitySelect/UniversityCountrySelector"
import UniversitySelector from "../../components/views/universitySelect/UniversitySelector"
import { FieldOfStudySelector } from "../../components/views/signup/userInformation/FieldOfStudySelector"
import { LevelOfStudySelector } from "../../components/views/signup/userInformation/LevelOfStudySelector"
import * as yup from "yup"
import { sxStyles } from "../../types/commonTypes"
import TextField from "@mui/material/TextField"
import { pushNotificationsFilteringSchema } from "../../components/views/signup/schemas"
import AddIcon from "@mui/icons-material/Add"

const styles = sxStyles({
   mainWrapper: {
      padding: 10,
      width: "100%",
      maxWidth: 1000,
      margin: "0 auto",
   },
   rowWrapper: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 4,
   },
   inputField: {
      width: "50%",
      height: "40px",
      borderRadius: 6,
      padding: 10,
      outline: 0,
   },
   textAreaField: {
      width: "100%",
      minWidth: "100%",
      minHeight: 200,
      maxHeight: 400,
      padding: 10,
      borderRadius: 6,
      borderWidth: 2,
      outline: 0,
   },
   buttonWrapper: {
      width: "100%",
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: 6,
      marginTop: 20,
   },
   subtitle: {
      textTransform: "uppercase",
      fontSize: "0.8rem !important",
      fontWeight: "bold",
   },
})
interface IFormValues {
   gender?: string
   university?: {
      name: string
      code: string
   }
   fieldOfStudy?: {
      name: string
      id: string
   }
   levelOfStudy?: {
      name: string
      id: string
   }
   livestream?: string
}

const schema: yup.SchemaOf<IFormValues> = yup
   .object()
   .shape(pushNotificationsFilteringSchema)

const CreateNotification = ({ notification }) => {
   const [title, setTitle] = useState(notification?.title || "")
   const [body, setBody] = useState(notification?.body || "")
   const [url, setUrl] = useState(notification?.url || "")
   const [open, setOpen] = useState(false)
   const [update, setUpdate] = useState(false)
   const [tabValue, setTabValue] = useState(0)
   const [inputValue, setInputValue] = useState("")
   const [filters, setFilters] = useState({
      university: null,
      universityCountryCode: "",
      gender: "",
      livestream: "",
      fieldOfStudy: null,
      levelOfStudy: null,
      emails: [],
   })
   const formikRef = useRef(null)
   const router = useRouter()
   const notificationId: any = router.query.id

   useEffect(() => {
      if (notificationId) {
         getSavedNotification(notificationId).then(
            (response: NotificationResponse) => {
               setTitle(response.title)
               setBody(response.body)
               setUrl(response.url)
               setTabValue(response.tabValue || 0)
               setFilters(response.filters)
            }
         )
      }
   }, [notificationId])

   const handleClose = () => {
      setOpen(false)
   }

   const handleOpen = () => {
      setOpen(true)
   }

   const handleSaveNotification = async () => {
      setUpdate(true)
      if (tabValue === 1) {
         formikRef?.current.submitForm()
      } else {
         return submitForm(filters, true)
      }
   }
   const handleSendNotification = async () => {
      try {
         setUpdate(false)
         if (tabValue === 1) {
            formikRef?.current.submitForm()
         } else {
            return submitForm(filters, false)
         }
      } catch (e) {
         console.log("Error: ", e)
      }
   }

   const handleChangeLivestream = (event: any) => {
      setFilters({ ...filters, livestream: event.target.value })
   }

   const handleChangeData = (event: any, newValue: number) => {
      setTabValue(newValue)
   }

   const handleAddTag = () => {
      if (inputValue.trim() && !filters.emails.includes(inputValue)) {
         setFilters({ ...filters, emails: [...filters.emails, inputValue] })
         setInputValue("")
      }
   }

   const handleDeleteTag = (tagToDelete: string) => {
      setFilters({
         ...filters,
         emails: filters.emails.filter((email) => email !== tagToDelete),
      })
   }

   const handleKeyDown = (event) => {
      if (event.key === "Enter") {
         event.preventDefault() // Prevent form submission if inside a form
         handleAddTag()
      }
   }

   const submitForm = async (values: any, updateField?: boolean) => {
      const updating = updateField !== undefined ? updateField : update
      if (updating) {
         const data: NotificationData = {
            title,
            body,
            url,
            tabValue,
            filters: values,
         }
         if (notificationId) {
            await updateSavedNotification(notificationId, data)
            alert("Notification successfully updated!")
         } else {
            const itemId = await createSavedNotification(data)
            alert("Notification successfully created!")
            router.push(`/admin/create-notification?id=${itemId}`)
         }
      } else {
         try {
            const response = await fetch("/api/send-notifications", {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
               },
               body: JSON.stringify({
                  filters: values,
                  activeTabFilter: tabValue,
                  message: { title, body, url },
               }),
            })

            await response.json()
            alert("Notification successfully sent!")
         } catch (e) {
            console.log("Error: ", e)
         }
      }
   }

   return (
      <>
         <Head>
            <title>CareerFairy | Admin Manage Notification</title>
         </Head>
         <AdminDashboardLayout>
            <div style={styles.mainWrapper}>
               <h1>
                  {notificationId
                     ? "Edit Notification"
                     : "Create New Notification"}
               </h1>

               <Grid container spacing={2}>
                  <Grid item xs={12} sm={12} md={6}>
                     <TextField
                        style={{ width: "100%" }}
                        id="title-field"
                        name="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        label="Notification title"
                        className="notificationTitle"
                     />
                  </Grid>
                  <Grid item xs={12} sm={12} md={6}>
                     <TextField
                        style={{ width: "100%" }}
                        id="url-field"
                        name="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        label="Notification URL"
                        className="notificationUrl"
                     />
                  </Grid>
               </Grid>
               <Grid container spacing={2}>
                  <Grid style={{ marginTop: 20 }} item xs={12} sm={12} md={12}>
                     <TextField
                        style={{ width: "100%" }}
                        id="body-field"
                        name="body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        label="Notification body"
                        className="notificationBody"
                     />
                  </Grid>
               </Grid>

               <h3>Filters</h3>

               <Box sx={{ width: "100%" }}>
                  <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                     <Tabs
                        value={tabValue}
                        onChange={handleChangeData}
                        aria-label="basic tabs example"
                     >
                        <Tab label="Livestream" />
                        <Tab label="User data" />
                        <Tab label="Emails" />
                     </Tabs>
                  </Box>
               </Box>

               {tabValue === 0 && (
                  <Grid container spacing={2}>
                     <Grid
                        style={{ marginTop: 20 }}
                        item
                        xs={12}
                        sm={12}
                        md={6}
                     >
                        <TextField
                           style={{ width: "100%" }}
                           id="livestream-field"
                           name="livestream"
                           onChange={handleChangeLivestream}
                           value={filters.livestream}
                           label="Livestream ID"
                           className="livestreamField"
                        />
                     </Grid>
                  </Grid>
               )}

               {tabValue === 1 && (
                  <div style={{ marginTop: 20 }}>
                     <Fragment>
                        <Formik
                           innerRef={formikRef}
                           enableReinitialize={true}
                           initialValues={filters}
                           validationSchema={schema}
                           onSubmit={(values) => submitForm(values)}
                        >
                           {({
                              values,
                              errors,
                              touched,
                              handleChange,
                              handleSubmit,
                              setFieldValue,
                           }) => (
                              <form id="signUpForm" onSubmit={handleSubmit}>
                                 <Grid container spacing={2}>
                                    <Grid item xs={12} sm={12} md={6}>
                                       <GenericDropdown
                                          id="gender-dropdown"
                                          name="gender"
                                          onChange={handleChange}
                                          value={values.gender}
                                          label="Gender"
                                          list={possibleGenders}
                                          className="registrationDropdown"
                                       />
                                    </Grid>
                                    <Grid item xs={12}>
                                       <Typography
                                          sx={styles.subtitle}
                                          variant="h5"
                                       >
                                          University
                                       </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                       <UniversityCountrySelector
                                          className="registrationInput"
                                          value={values.universityCountryCode}
                                          handleClose={handleClose}
                                          submitting={false}
                                          setFieldValue={setFieldValue}
                                          error={
                                             errors.universityCountryCode &&
                                             touched.universityCountryCode
                                                ? errors.universityCountryCode
                                                : null
                                          }
                                          handleOpen={handleOpen}
                                          open={open}
                                       />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                       <UniversitySelector
                                          className="registrationInput"
                                          error={
                                             errors.university &&
                                             touched.university
                                                ? errors.university
                                                : null
                                          }
                                          universityCountryCode={
                                             values.universityCountryCode
                                          }
                                          values={values}
                                          submitting={false}
                                          setFieldValue={setFieldValue}
                                       />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                       <FieldOfStudySelector
                                          // @ts-ignore
                                          setFieldValue={setFieldValue}
                                          // @ts-ignore
                                          value={values.fieldOfStudy}
                                          className="registrationInput"
                                          disabled={false}
                                          error={
                                             errors.fieldOfStudy &&
                                             touched.fieldOfStudy
                                                ? errors.fieldOfStudy
                                                : null
                                          }
                                       />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                       <LevelOfStudySelector
                                          setFieldValue={setFieldValue}
                                          value={values.levelOfStudy}
                                          className="registrationInput"
                                          disabled={false}
                                          error={
                                             errors.levelOfStudy &&
                                             touched.levelOfStudy
                                                ? errors.levelOfStudy
                                                : null
                                          }
                                       />
                                    </Grid>
                                 </Grid>
                              </form>
                           )}
                        </Formik>
                     </Fragment>
                  </div>
               )}

               {tabValue === 2 && (
                  <Box sx={{ width: "100%" }} style={{ marginTop: 20 }}>
                     <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        {filters.emails.map((tag, index) => (
                           <Chip
                              key={index}
                              label={tag}
                              onDelete={() => handleDeleteTag(tag)}
                              color="primary"
                              variant="outlined"
                           />
                        ))}
                     </Stack>
                     <Stack direction="row" spacing={1}>
                        <TextField
                           style={{ width: "50%" }}
                           variant="outlined"
                           size="medium"
                           label="Add Email"
                           value={inputValue}
                           onChange={(e) => setInputValue(e.target.value)}
                           onKeyDown={handleKeyDown}
                        />
                        <IconButton
                           color="primary"
                           onClick={handleAddTag}
                           aria-label="add tag"
                        >
                           <AddIcon />
                        </IconButton>
                     </Stack>
                  </Box>
               )}

               <div style={styles.buttonWrapper}>
                  <Button
                     onClick={handleSaveNotification}
                     color={"primary"}
                     variant={"contained"}
                     disabled={!title || !body || !url}
                  >
                     {notificationId
                        ? "Update Notification"
                        : "Create Notification"}
                  </Button>
                  <Button
                     onClick={handleSendNotification}
                     color={"secondary"}
                     variant={"contained"}
                     disabled={!title || !body || !url}
                  >
                     Send Notification
                  </Button>
               </div>
            </div>
         </AdminDashboardLayout>
      </>
   )
}

export default CreateNotification
