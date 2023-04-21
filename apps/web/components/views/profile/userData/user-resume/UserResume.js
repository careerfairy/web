import React, { useCallback, useRef, useState } from "react"
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline"
import Publish from "@mui/icons-material/Publish"
import { Switch } from "@mui/material"
import makeStyles from "@mui/styles/makeStyles"
import * as actions from "store/actions"
import { useDispatch } from "react-redux"
import { withFirebase } from "context/firebase/FirebaseServiceContext"
import ContentCardTitle from "../../../../../layouts/UserLayout/ContentCardTitle"
import UploadCvButton from "./UploadCvButton"
import { rewardService } from "data/firebase/RewardService"
import { errorLogAndNotify } from "util/CommonUtil"

const useStyles = makeStyles((theme) => ({
   cvContainer: {
      textAlign: "center",
      padding: "40px 20px",
      marginBottom: 20,
   },
   uploadedContainer: {
      textAlign: "center",
      padding: "40px 10px 20px 10px",
      marginBottom: 10,
   },
   cvButton: {
      cursor: "pointer",
   },
   buttons: {
      marginTop: 25,
      backgroundColor: theme.palette.grey[300],
   },
   button: {
      // backgroundColor: theme.palette.background.default,
   },
   largeIcon: {
      fontSize: "3.5rem",
      marginBottom: 10,
   },
   switch: (props) => ({
      marginTop: 40,
      fontWeight: props.shareCvWithTalentPool ? "bold" : "normal",
      color: props.shareCvWithTalentPool
         ? theme.palette.primary.main
         : theme.palette.background.main,
   }),
}))

const buttonChoices = ["Download CV", "Upload New CV [.pdf]", "Delete CV"]

const UserResume = ({
   firebase,
   userData,
   outsideProfile,
   showOnlyButton,
   disabled,
}) => {
   const dispatch = useDispatch()
   const anchorRef = useRef(null)

   const [open, setOpen] = useState(false)
   const [selectedIndex, setSelectedIndex] = useState(1)
   const classes = useStyles({ shareCvWithTalentPool: userData?.shareResume })

   const uploadLogo = useCallback(
      (logoFile) => {
         var storageRef = firebase.getStorageRef()
         let presentationRef = storageRef.child(
            "user_resume/" + userData.userEmail + ".pdf"
         )

         var uploadTask = presentationRef.put(logoFile)

         uploadTask.on(
            "state_changed",
            function (snapshot) {
               var progress =
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 100
               console.log("Upload is " + progress + "% done")
               switch (snapshot.state) {
                  case "paused":
                     console.log("Upload is paused")
                     break
                  case "running":
                     console.log("Upload is running")
                     break
                  default:
                     break
               }
            },
            function (error) {
               switch (error.code) {
                  case "storage/unauthorized":
                     break
                  case "storage/canceled":
                     break
                  case "storage/unknown":
                     break
                  default:
                     break
               }
            },
            function () {
               //Upload completed successfully, now we can get the download URL
               console.log("upload successful")

               rewardService
                  .userAction("USER_CV_UPLOAD")
                  .catch(errorLogAndNotify)

               uploadTask.snapshot.ref
                  .getDownloadURL()
                  .then(function (downloadURL) {
                     console.log("Download Url", downloadURL)
                     dispatch(
                        actions.editUserProfile({
                           userResume: downloadURL,
                           shareResume: true,
                        })
                     )
                     setSelectedIndex(0)
                  })
            }
         )
         return uploadTask
      },
      [dispatch, firebase, userData.userEmail]
   )

   const deleteResume = useCallback(() => {
      var storageRef = firebase.getStorageRef()
      let presentationRef = storageRef.child(
         "user_resume/" + userData.userEmail + ".pdf"
      )

      presentationRef.delete().then(() => {
         console.log("delete successful")
         dispatch(actions.editUserProfile({ userResume: "" }))
      })
   }, [dispatch, firebase, userData.userEmail])

   const updateShareCvStatus = useCallback(
      (event) => {
         dispatch(
            actions.editUserProfile({ shareResume: event.target.checked })
         )
      },
      [dispatch]
   )

   const handleToggle = () => {
      setOpen((prevOpen) => !prevOpen)
   }

   const handleMenuItemClick = (event, index) => {
      setSelectedIndex(index)
      setOpen(false)
   }

   const handleClose = (event) => {
      if (anchorRef.current && anchorRef.current.contains(event.target)) {
         return
      }
      setOpen(false)
   }

   const renderUploadCvBox = useCallback(
      () => (
         <>
            {!outsideProfile && <ContentCardTitle>Your CV</ContentCardTitle>}
            {userData && userData.userResume ? (
               <div className={classes.uploadedContainer}>
                  <div className={classes.cvButton}>
                     <CheckCircleOutline
                        className={classes.largeIcon}
                        color="primary"
                     />
                     <div>You have successfully uploaded your CV!</div>
                     <UploadCvButton
                        userData={userData}
                        uploadLogo={uploadLogo}
                        classes={classes}
                        anchorRef={anchorRef}
                        selectedIndex={selectedIndex}
                        deleteResume={deleteResume}
                        handleToggle={handleToggle}
                        handleClose={handleClose}
                        buttonChoices={buttonChoices}
                        handleMenuItemClick={handleMenuItemClick}
                        openDropdown={open}
                     />
                     {!outsideProfile && (
                        <div className={classes.switch}>
                           <Switch
                              checked={userData?.shareResume}
                              onChange={updateShareCvStatus}
                              color="primary"
                           />
                           I want to share my CV with a company when joining
                           their Talent Pool.
                        </div>
                     )}
                  </div>
               </div>
            ) : (
               <div className={classes.cvContainer}>
                  <Publish className={classes.largeIcon} color="primary" />
                  <div>You can upload your current CV.</div>
                  <UploadCvButton userData={userData} uploadLogo={uploadLogo} />
               </div>
            )}
         </>
      ),
      [
         classes,
         deleteResume,
         open,
         outsideProfile,
         selectedIndex,
         updateShareCvStatus,
         uploadLogo,
         userData,
      ]
   )

   return showOnlyButton ? (
      <UploadCvButton
         userData={userData}
         uploadLogo={uploadLogo}
         classes={classes}
         anchorRef={anchorRef}
         selectedIndex={selectedIndex}
         deleteResume={deleteResume}
         handleToggle={handleToggle}
         handleClose={handleClose}
         buttonChoices={buttonChoices}
         handleMenuItemClick={handleMenuItemClick}
         openDropdown={open}
         disabled={disabled}
         showOnlyButton={true}
      />
   ) : (
      renderUploadCvBox()
   )
}

export default withFirebase(UserResume)
