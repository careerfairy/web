import React, { Fragment, useEffect, useRef, useState } from "react"
import { Formik } from "formik"
import { useRouter } from "next/router"
import {
   createSavedNotification,
   updateSavedNotification,
   getSavedNotification,
} from "../../data/firebase/FirestoreService"
import Button from "@mui/material/Button"
import Head from "next/head"
import AdminDashboardLayout from "../../layouts/AdminDashboardLayout"
import { Grid, Typography } from "@mui/material"
import GenericDropdown from "../../components/views/common/GenericDropdown"
import { possibleGenders } from "@careerfairy/shared-lib/constants/forms"
import UniversityCountrySelector from "../../components/views/universitySelect/UniversityCountrySelector"
import UniversitySelector from "../../components/views/universitySelect/UniversitySelector"
import { FieldOfStudySelector } from "../../components/views/signup/userInformation/FieldOfStudySelector"
import { LevelOfStudySelector } from "../../components/views/signup/userInformation/LevelOfStudySelector"
import { UserData } from "@careerfairy/shared-lib/users"
import * as yup from "yup"
import { sxStyles } from "../../types/commonTypes"

const styles = sxStyles({
   submit: {
      margin: (theme) => theme.spacing(3, 0, 2),
   },
   subtitle: {
      textTransform: "uppercase",
      fontSize: "0.8rem !important",
      fontWeight: "bold",
   },
})
interface IFormValues
   extends Pick<
      UserData,
      "fieldOfStudy" | "levelOfStudy" | "universityCountryCode" | "gender"
   > {
   gender?: string
   university: {
      name: string
      code: string
   }
}

const schema: yup.SchemaOf<IFormValues> = yup.object()

const CreateNotification = ({ notification }) => {
   const [title, setTitle] = useState(notification?.title || "")
   const [body, setBody] = useState(notification?.body || "")
   const [url, setUrl] = useState(notification?.url || "")
   const [open, setOpen] = useState(false)
   const [update, setUpdate] = useState(false)
   const [filters, setFilters] = useState({
      university: null,
      universityCountryCode: "",
      gender: "",
      fieldOfStudy: null,
      levelOfStudy: null,
   })
   const formikRef = useRef(null)
   const router = useRouter()
   const notificationId: any = router.query.id

   useEffect(() => {
      if (notificationId) {
         getSavedNotification(notificationId).then((response: any) => {
            setTitle(response.title)
            setBody(response.body)
            setUrl(response.url)
            setFilters(response.filters)
         })
      }
   }, [notificationId])

   const handleSaveNotification = async () => {
      setUpdate(true)
      formikRef?.current.submitForm()
   }

   const handleClose = () => {
      setOpen(false)
   }

   const handleOpen = () => {
      setOpen(true)
   }

   const handleSendNotification = async () => {
      try {
         setUpdate(false)
         formikRef?.current.submitForm()
      } catch (e) {
         console.log("Error: ", e)
      }
   }

   const submitForm = async (values: any) => {
      if (update) {
         const data = { title, body, url, filters: values }
         if (notificationId) {
            await updateSavedNotification(notificationId, data)
         } else {
            alert("Notification successfully created!")
            const itemId = await createSavedNotification(data)
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
            <div
               style={{
                  padding: 10,
                  width: "100%",
                  maxWidth: 1000,
                  margin: "0 auto",
               }}
            >
               <h1>
                  {notificationId
                     ? "Edit Notification"
                     : "Create New Notification"}
               </h1>
               <div
                  style={{
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "space-between",
                     gap: 4,
                  }}
               >
                  <input
                     style={{
                        width: "50%",
                        height: "40px",
                        borderRadius: 6,
                        padding: 10,
                        outline: 0,
                     }}
                     type="text"
                     placeholder="Title"
                     value={title}
                     onChange={(e) => setTitle(e.target.value)}
                  />

                  <input
                     style={{
                        width: "50%",
                        height: "40px",
                        borderRadius: 6,
                        padding: 10,
                        outline: 0,
                     }}
                     type="text"
                     placeholder="URL"
                     value={url}
                     onChange={(e) => setUrl(e.target.value)}
                  />
               </div>
               <div style={{ width: "100%", marginTop: 10 }}>
                  <textarea
                     style={{
                        width: "100%",
                        minWidth: "100%",
                        minHeight: 200,
                        maxHeight: 400,
                        padding: 10,
                        borderRadius: 6,
                        borderWidth: 2,
                        outline: 0,
                     }}
                     placeholder="Body"
                     value={body}
                     onChange={(e) => setBody(e.target.value)}
                  />
               </div>
               <h3>Filters</h3>

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
                              <Grid item xs={12} sm={12} md={4}>
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
                                 <Typography sx={styles.subtitle} variant="h5">
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
                                       errors.university && touched.university
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
                                    setFieldValue={setFieldValue}
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

               <div
                  style={{
                     width: "100%",
                     display: "flex",
                     justifyContent: "flex-end",
                     alignItems: "center",
                     gap: 6,
                     marginTop: 20,
                  }}
               >
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
