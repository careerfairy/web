import React, { useState } from "react";
import PropTypes from "prop-types";
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
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";

import PublishIcon from "@mui/icons-material/Publish";
import { useSnackbar } from "notistack";
import { GENERAL_ERROR } from "../../../../util/constants";
import {
   dataURLtoFile,
   uploadLogo,
} from "../../../../helperFunctions/HelperFunctions";
import { useFirebaseService } from "../../../../../context/firebase/FirebaseServiceContext";
import StreamCardSkeleton from "../../../common/loaders/StreamCardSkeleton";
import { placeholderBanner } from "../../../../../constants/images";
import { useDispatch } from "react-redux";

import * as actions from "store/actions";
import ImagePickerContainer from "../../../../ssr/ImagePickerContainer";

const styles = {
   root: {
      padding: 0,
   },
   content: {
      padding: 0,
   },
   previewWrapper: {
      height: 500,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
   },
   bannerMedia: {
      padding: 0,
      marginBottom: (theme) => theme.spacing(1),
      height: "100%",
      width: "100%",
      backgroundColor: (theme) => theme.palette.navyBlue.main,
      "& img": {
         objectFit: "cover",
         opacity: 0.8,
      },
   },
   logoWrapper: {
      padding: 0,
      position: "absolute",

      height: "50%",
      width: "30%",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
   logo: {
      background: "white",
      width: "100%",
      height: "80%",
      borderRadius: 1,
      boxShadow: 5,
   },
   groupTitle: {
      width: "110%",
      mt: 2,
      mb: 1,
      height: 5,
      background: "white",
      borderRadius: 1,
   },
   groupSummary: {
      background: "white",
      width: "90%",
      height: 3,
      borderRadius: 1,
   },
   lowerPreview: {
      height: "60%",
      width: "60%",
      p: 1,
   },
   upperPreview: {
      height: "40%",
      width: "100%",
      position: "relative",
   },
   actionsWrapper: {
      display: "flex",
      flexDirection: "column",
   },
   saveButton: {
      marginTop: (theme) => theme.spacing(1),
   },
};

const ProfileBanner = ({ group: { bannerImageUrl, id } }) => {
   const imageUrl = bannerImageUrl || placeholderBanner;
   const firebase = useFirebaseService();
   const [editData, setEditData] = useState({});
   const [removingLogo, setRemovingLogo] = useState(false);
   const [filePickerError, setFilePickerError] = useState("");
   const [submittingLogo, setSubmittingLogo] = useState(false);
   const { enqueueSnackbar } = useSnackbar();
   const dispatch = useDispatch();

   const handleSubmitLogo = async (e) => {
      e.preventDefault();
      try {
         setSubmittingLogo(true);
         await uploadLogo(
            "banner-images",
            editData.fileObj,
            firebase,
            async (newUrl, fullPath) => {
               try {
                  await firebase.updateCareerCenter(id, {
                     bannerImageUrl: newUrl,
                  });
                  dispatch(
                     actions.sendSuccessMessage(
                        "Your banner has been successfully updated."
                     )
                  );
               } catch (e) {
                  dispatch(actions.sendGeneralError(e));
               }
               setEditData({});
            }
         );
      } catch (e) {
         enqueueSnackbar(GENERAL_ERROR, {
            variant: "error",
            preventDuplicate: true,
         });
      }
      setSubmittingLogo(false);
   };

   const handleRemoveLogo = async () => {
      try {
         setRemovingLogo(true);
         await firebase.updateCareerCenter(id, {
            bannerImageUrl: "",
         });
      } catch (e) {
         dispatch(actions.sendGeneralError(e));
      }
      setRemovingLogo(false);
   };

   return (
      <Card sx={styles.root}>
         <CardHeader
            title={"Upload a custom banner"}
            subheader={
               <>
                  Change the banner as seen on your{" "}
                  <a target="_blank" href={`/next-livestreams/${id}`}>
                     events
                  </a>{" "}
                  page. The optimal size is <b>1600x600px.</b>
               </>
            }
         />
         <CardContent sx={styles.content}>
            <Box alignItems="center" display="flex" flexDirection="column">
               <Box sx={styles.previewWrapper}>
                  <Box sx={styles.upperPreview}>
                     <Box sx={styles.logoWrapper}>
                        <Box sx={styles.logo} />
                        <Box sx={styles.groupTitle} />
                        <Box sx={styles.groupSummary} />
                     </Box>
                     <Avatar
                        variant="square"
                        sx={styles.bannerMedia}
                        src={editData.logoUrl || imageUrl}
                     />
                  </Box>
                  <Box sx={styles.lowerPreview}>
                     <Grid sx={{ height: "100%" }} container spacing={1}>
                        <Grid xs={6} item>
                           <StreamCardSkeleton />
                        </Grid>
                        <Grid xs={6} item>
                           <StreamCardSkeleton />
                        </Grid>
                        <Grid xs={6} item>
                           <StreamCardSkeleton />
                        </Grid>
                        <Grid xs={6} item>
                           <StreamCardSkeleton />
                        </Grid>
                     </Grid>
                  </Box>
               </Box>
            </Box>
         </CardContent>
         <Divider />
         <CardActions disableSpacing sx={styles.actionsWrapper}>
            <ImagePickerContainer
               style={{ width: "100%" }}
               extensions={["jpg", "jpeg", "png"]}
               maxSize={10}
               dims={{
                  minWidth: 530,
                  maxWidth: 3200,
                  minHeight: 200,
                  maxHeight: 1200,
               }}
               onChange={(base64Img) => {
                  const fileObject = dataURLtoFile(base64Img, uuidv4());
                  setFilePickerError(null);
                  setEditData({
                     ...editData,
                     fileObj: fileObject,
                     logoUrl: URL.createObjectURL(fileObject),
                  });
               }}
               onError={(errMsg) => setFilePickerError(errMsg)}
            >
               <Box flexDirection="column" display="flex" alignItems="center">
                  <Button
                     color="primary"
                     size="large"
                     disabled={submittingLogo}
                     fullWidth
                     endIcon={<PublishIcon />}
                  >
                     {editData.logoUrl ? "Change" : "Upload Banner"}
                  </Button>
               </Box>
            </ImagePickerContainer>
            <Grow unmountOnExit in={Boolean(bannerImageUrl)}>
               <Button
                  sx={styles.saveButton}
                  color="grey"
                  onClick={handleRemoveLogo}
                  size="large"
                  variant="contained"
                  fullWidth
                  disabled={removingLogo}
                  endIcon={
                     submittingLogo && (
                        <CircularProgress size={20} color="inherit" />
                     )
                  }
               >
                  Remove Banner
               </Button>
            </Grow>
            <Grow unmountOnExit in={Boolean(editData.fileObj)}>
               <Button
                  sx={styles.saveButton}
                  color="secondary"
                  onClick={handleSubmitLogo}
                  size="large"
                  variant="contained"
                  fullWidth
                  disabled={submittingLogo}
                  endIcon={
                     submittingLogo && (
                        <CircularProgress size={20} color="inherit" />
                     )
                  }
               >
                  save
               </Button>
            </Grow>
            <FormHelperText error>{filePickerError}</FormHelperText>
         </CardActions>
      </Card>
   );
};

ProfileBanner.propTypes = {
   className: PropTypes.string,
   group: PropTypes.object,
   firebase: PropTypes.object,
};

export default ProfileBanner;
