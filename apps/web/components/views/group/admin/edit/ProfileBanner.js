import React, { useState } from "react"
import PropTypes from "prop-types"
import {
   Avatar,
   Box,
   Button,
   Card,
   CardActions,
   CardContent,
   CardHeader,
   CircularProgress,
   Divider,
   FormHelperText,
   Grid,
   Grow,
} from "@mui/material"
import { v4 as uuidv4 } from "uuid"

import PublishIcon from "@mui/icons-material/Publish"
import { useSnackbar } from "notistack"
import { GENERAL_ERROR } from "../../../../util/constants"
import {
   dataURLtoFile,
   uploadLogo,
} from "../../../../helperFunctions/HelperFunctions"
import { useFirebaseService } from "../../../../../context/firebase/FirebaseServiceContext"
import StreamCardSkeleton from "../../../common/loaders/StreamCardSkeleton"
import { placeholderBanner } from "../../../../../constants/images"
import { useDispatch } from "react-redux"

import * as actions from "store/actions"
import ImagePickerContainer from "../../../../ssr/ImagePickerContainer"
import CloseRounded from "@mui/icons-material/CloseRounded"
import Save from "@mui/icons-material/Save"
import PreviewIcon from "@mui/icons-material/Preview"
import { alpha } from "@mui/material/styles"
import { BANNER_IMAGE_SPECS } from "@careerfairy/shared-lib/dist/groups/GroupPresenter"

const styles = {
   root: {
      padding: 0,
   },
   content: {
      padding: 0,
   },
   previewWrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
      height: "100%",
      background: "blue",
      aspectRatio: "5/1",
      position: "relative",
   },
   hoverOverlay: (theme) => ({
      position: "absolute",
      inset: 0,
      transition: theme.transitions.create(["opacity"]),
      opacity: 0,
      display: "grid",
      placeItems: "center",
      color: "white",
      "&:hover, &:focus": {
         opacity: 1,
         background: alpha(theme.palette.common.black, 0.5),
      },
   }),
   bannerMedia: {
      padding: 0,
      height: "100%",
      width: "100%",
      backgroundColor: (theme) => theme.palette.navyBlue.main,
      "& img": {
         objectFit: "cover",
         opacity: 0.8,
      },
   },
   lowerPreview: {
      height: "60%",
      width: "60%",
      p: 1,
   },
   upperPreview: {
      flex: 1,
      position: "relative",
   },
   actionsWrapper: {
      display: "flex",
      flexDirection: "column",
   },
   saveButton: {
      marginTop: (theme) => theme.spacing(1),
   },
}

const ProfileBanner = ({ group }) => {
   const imageUrl = group.bannerImageUrl || placeholderBanner
   const firebase = useFirebaseService()
   const [editData, setEditData] = useState({})
   const [removingLogo, setRemovingLogo] = useState(false)
   const [filePickerError, setFilePickerError] = useState("")
   const [submittingLogo, setSubmittingLogo] = useState(false)
   const { enqueueSnackbar } = useSnackbar()
   const dispatch = useDispatch()

   const handleSubmitLogo = async (e) => {
      e.preventDefault()
      try {
         setSubmittingLogo(true)
         await uploadLogo(
            "banner-images",
            editData.fileObj,
            firebase,
            async (newUrl) => {
               try {
                  await firebase.updateCareerCenter(group, {
                     bannerImageUrl: newUrl,
                  })
                  dispatch(
                     actions.sendSuccessMessage(
                        "Your banner has been successfully updated."
                     )
                  )
               } catch (e) {
                  dispatch(actions.sendGeneralError(e))
               }
               setEditData({})
               setSubmittingLogo(false)
            }
         )
      } catch (e) {
         enqueueSnackbar(GENERAL_ERROR, {
            variant: "error",
            preventDuplicate: true,
         })
      }
   }

   const handleRemoveLogo = async () => {
      try {
         setFilePickerError("")
         setRemovingLogo(true)
         await firebase.updateCareerCenter(group, {
            bannerImageUrl: "",
         })
      } catch (e) {
         dispatch(actions.sendGeneralError(e))
      }
      setRemovingLogo(false)
   }

   return (
      <Card sx={styles.root}>
         <CardHeader
            title={"Change the banner for your events page"}
            subheader={
               <>
                  Change the banner as seen on your{" "}
                  <a target="_blank" href={`/next-livestreams/${group.id}`}>
                     events
                  </a>{" "}
                  page. The optimal size is <b>2880x576px</b> at an aspect ratio
                  of <b>5:1</b>
               </>
            }
         />
         <CardContent sx={styles.content}>
            <Box sx={styles.previewWrapper}>
               <Avatar
                  variant="square"
                  sx={styles.bannerMedia}
                  src={editData.logoUrl || imageUrl}
               />
               <Box
                  component="a"
                  target="_blank"
                  href={`/next-livestreams/${group.id}`}
                  sx={styles.hoverOverlay}
               >
                  <Button
                     color="info"
                     variant="text"
                     size="large"
                     startIcon={<PreviewIcon fontSize="large" />}
                  >
                     View event page
                  </Button>
               </Box>
            </Box>
         </CardContent>
         <Divider />
         <CardActions disableSpacing sx={styles.actionsWrapper}>
            <ImagePickerContainer
               style={{ width: "100%" }}
               extensions={BANNER_IMAGE_SPECS.allowedFormats}
               maxSize={BANNER_IMAGE_SPECS.maxSize}
               dims={{
                  minWidth: BANNER_IMAGE_SPECS.minWidth,
                  maxWidth: BANNER_IMAGE_SPECS.maxWidth,
                  minHeight: BANNER_IMAGE_SPECS.minHeight,
                  maxHeight: BANNER_IMAGE_SPECS.maxHeight,
               }}
               onChange={(base64Img) => {
                  const fileObject = dataURLtoFile(base64Img, uuidv4())
                  setFilePickerError(null)
                  setEditData({
                     ...editData,
                     fileObj: fileObject,
                     logoUrl: URL.createObjectURL(fileObject),
                  })
               }}
               onError={(errMsg) => setFilePickerError(errMsg)}
            >
               <Box flexDirection="column" display="flex" alignItems="center">
                  <Button
                     color="primary"
                     size="large"
                     disabled={submittingLogo || removingLogo}
                     fullWidth
                     startIcon={<PublishIcon />}
                  >
                     {editData.logoUrl ? "Change" : "Upload Banner"}
                  </Button>
               </Box>
            </ImagePickerContainer>

            <Grow unmountOnExit in={Boolean(editData.fileObj)}>
               <Button
                  sx={styles.saveButton}
                  color="primary"
                  onClick={handleSubmitLogo}
                  size="large"
                  startIcon={
                     submittingLogo ? (
                        <CircularProgress size={20} color="inherit" />
                     ) : (
                        <Save />
                     )
                  }
                  variant="contained"
                  fullWidth
                  disabled={submittingLogo || removingLogo}
               >
                  {submittingLogo ? "saving" : "save"}
               </Button>
            </Grow>
            <Grow
               unmountOnExit
               in={Boolean(group.bannerImageUrl && !editData.fileObj)}
            >
               <Button
                  sx={styles.saveButton}
                  color="grey"
                  onClick={handleRemoveLogo}
                  size="large"
                  startIcon={
                     removingLogo ? (
                        <CircularProgress size={20} color="inherit" />
                     ) : (
                        <CloseRounded />
                     )
                  }
                  variant="outlined"
                  fullWidth
                  disabled={submittingLogo || removingLogo}
               >
                  Remove Banner
               </Button>
            </Grow>
            <FormHelperText error>{filePickerError}</FormHelperText>
         </CardActions>
      </Card>
   )
}

ProfileBanner.propTypes = {
   className: PropTypes.string,
   group: PropTypes.object,
   firebase: PropTypes.object,
}

export default ProfileBanner
