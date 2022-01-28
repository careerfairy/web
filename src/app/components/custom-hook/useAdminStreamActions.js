import React, { Fragment, useEffect, useState } from "react";
import { useFirebaseService } from "context/firebase/FirebaseServiceContext";
import ShareIcon from "@mui/icons-material/Share";
import GetAppIcon from "@mui/icons-material/GetApp";
import { v4 as uuidv4 } from "uuid";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { CSVLink } from "react-csv";
import StatsUtil from "data/util/StatsUtil";
import { PDFDownloadLink } from "@react-pdf/renderer";
import LivestreamPdfReport from "./LivestreamPdfReport";
import { useLivestreamMetadata } from "components/custom-hook/useLivestreamMetadata";
import { useTalentPoolMetadata } from "components/custom-hook/useTalentPoolMetadata";
import makeStyles from '@mui/styles/makeStyles';
import PublishIcon from "@mui/icons-material/Publish";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { useSnackbar } from "notistack";
import AreYouSureModal from "../../../../../../materialUI/GlobalModals/AreYouSureModal";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { copyStringToClipboard } from "../../../../../helperFunctions/HelperFunctions";
import { useAuth } from "../../../../../../HOCs/AuthProvider";
import StreamerLinksDialog from "./StreamerLinksDialog";

const useStyles = makeStyles((theme) => {
   const themeWhite = theme.palette.common.white;
   return {
      button: {
         color: themeWhite,
         border: `2px solid ${themeWhite}`,
         marginBottom: theme.spacing(1),
      },
      divider: {
         background: theme.palette.common.white,
      },
   };
});
const useAdminStreamActions = ({
   livestream,
   group,
   isPastLivestream,
   switchToNextLivestreamsTab,
   handleEditStream,
   isDraft,
}) => {
   const firebase = useFirebaseService();
   const classes = useStyles();
   const { authenticatedUser, userData } = useAuth();
   const { enqueueSnackbar } = useSnackbar();

   const [groupCategories, setGroupCategories] = useState([]);
   const [allGroups, setAllGroups] = useState([]);

   const [registeredStudents, setRegisteredStudents] = useState([]);
   const [
      registeredStudentsFromGroup,
      setRegisteredStudentsFromGroup,
   ] = useState([]);
   const [publishingDraft, setPublishingDraft] = useState(false);

   const [deletingStream, setDeletingStream] = useState(false);
   const [openAreYouSureModal, setOpenAreYouSureModal] = useState(false);
   const [startDownloadingReport, setStartDownloadingReport] = useState(false);
   const [openStreamerLinksDialog, setOpenStreamerLinksDialog] = useState(
      false
   );
   const {
      hasDownloadedReport,
      questions,
      polls,
      icons,
      overallRating,
      contentRating,
      talentPoolForReport,
      participatingStudents,
      participatingStudentsFromGroup,
      studentStats,
   } = useLivestreamMetadata(
      livestream,
      group,
      firebase,
      startDownloadingReport
   );

   const [startDownloadingTalentPool, setStartDownloadingTalentPool] = useState(
      false
   );
   const { hasDownloadedTalentPool, talentPool } = useTalentPoolMetadata(
      livestream,
      allGroups,
      group,
      firebase,
      registeredStudentsFromGroup,
      startDownloadingTalentPool
   );

   useEffect(() => {
      if (group && group.categories) {
         let fieldOfStudyCategories = group.categories.find(
            (category) => category.name?.toLowerCase() === "field of study"
         );
         if (fieldOfStudyCategories && fieldOfStudyCategories.options) {
            setGroupCategories(fieldOfStudyCategories.options);
         }
      }
   }, [group]);

   useEffect(() => {
      firebase.getAllCareerCenters().then((querySnapshot) => {
         let careerCenters = [];
         querySnapshot.forEach((doc) => {
            let cc = doc.data();
            cc.id = doc.id;
            careerCenters.push(cc);
         });
         setAllGroups(careerCenters);
      });
   }, []);

   useEffect(() => {
      if (livestream && group) {
         firebase
            .getLivestreamRegisteredStudents(livestream.id)
            .then((querySnapshot) => {
               let registeredStudents = [];
               querySnapshot.forEach((doc) => {
                  let student = doc.data();
                  student.id = doc.id;
                  registeredStudents.push(student);
               });
               setRegisteredStudents(registeredStudents);
            });
      }
   }, [livestream]);

   useEffect(() => {
      if (registeredStudents && registeredStudents.length) {
         let newRegisteredStudentsFromGroup = [];
         if (group.universityCode) {
            newRegisteredStudentsFromGroup = registeredStudents
               .filter((student) => studentBelongsToGroup(student))
               .map((filteredStudent) =>
                  StatsUtil.getStudentInGroupDataObject(filteredStudent, group)
               );
         } else {
            const livestreamGroups = allGroups.filter((group) =>
               livestream.groupIds.includes(group.id)
            );
            newRegisteredStudentsFromGroup = registeredStudents.map(
               (student) => {
                  const livestreamGroupUserBelongsTo = StatsUtil.getFirstGroupThatUserBelongsTo(
                     student,
                     livestreamGroups,
                     group
                  );
                  return StatsUtil.getStudentInGroupDataObject(
                     student,
                     livestreamGroupUserBelongsTo || {}
                  );
               }
            );
         }
         setRegisteredStudentsFromGroup(newRegisteredStudentsFromGroup);
      }
   }, [registeredStudents]);

   function studentBelongsToGroup(student) {
      if (group.universityCode) {
         if (student.university?.code === group.universityCode) {
            return student.groupIds && student.groupIds.includes(group.groupId);
         } else {
            return false;
         }
      } else {
         return student.groupIds && student.groupIds.includes(group.groupId);
      }
   }

   function getOptionName(optionId) {
      let correspondingOption = {};
      correspondingOption = groupCategories.find(
         (option) => option.id === optionId
      );
      return correspondingOption?.name || "CATEGORY_UNDEFINED";
   }

   const sendErrorMessage = () => {
      enqueueSnackbar("something went Wrong, please refresh the page", {
         variant: "error",
         preventDuplicate: true,
      });
   };

   const handleCloseAreYouSureModal = () => {
      setOpenAreYouSureModal(false);
   };
   const handleOPenAreYouSureModal = () => {
      setOpenAreYouSureModal(true);
   };

   const handleDeleteStream = async () => {
      try {
         setDeletingStream(true);
         const targetCollection = isDraft ? "draftLivestreams" : "livestreams";
         await firebase.deleteLivestream(livestream.id, targetCollection);
         setDeletingStream(false);
      } catch (e) {
         setDeletingStream(false);
         console.log("-> e", e);
         sendErrorMessage();
      }
   };

   const handleCreateExternalLink = () => {
      let baseUrl = "https://careerfairy.io";
      if (window?.location?.origin) {
         baseUrl = window.location.origin;
      }
      const draftId = livestream.id;
      const targetPath = `${baseUrl}/draft-stream?draftStreamId=${draftId}`;
      copyStringToClipboard(targetPath);
      enqueueSnackbar("Link has been copied to your clipboard!", {
         variant: "success",
         preventDuplicate: true,
      });
   };

   const handlePublishStream = async () => {
      try {
         setPublishingDraft(true);
         const newStream = { ...livestream };
         newStream.companyId = uuidv4();
         const author = getAuthor(newStream);
         await firebase.addLivestream(newStream, "livestreams", author);
         await firebase.deleteLivestream(livestream.id, "draftLivestreams");
         switchToNextLivestreamsTab();
         setPublishingDraft(false);
      } catch (e) {
         setPublishingDraft(false);
         sendErrorMessage();
      }
   };

   const getAuthor = (livestream) => {
      return livestream?.author?.email
         ? livestream.author
         : {
              email: authenticatedUser.email,
              ...(group?.id && { groupId: group.id }),
           };
   };

   const isWorkInProgress = () => !livestream.status?.pendingApproval;

   const canDownloadRegisteredStudents = () =>
      Boolean(group.universityCode || group.privacyPolicyActive);

   return (
      <>
         <Box p={2} style={{ width: "100%" }}>
            <Typography
               gutterBottom
               align="center"
               style={{ fontWeight: "bold" }}
               variant="h5"
            >
               {registeredStudentsFromGroup.length} students registered
            </Typography>
            {isDraft && (
               <Button
                  className={classes.button}
                  fullWidth
                  disabled={publishingDraft || isWorkInProgress()}
                  onClick={handlePublishStream}
                  startIcon={
                     publishingDraft ? (
                        <CircularProgress size={20} color="inherit" />
                     ) : (
                        <PublishIcon />
                     )
                  }
                  variant="outlined"
               >
                  {publishingDraft
                     ? "Publishing"
                     : isWorkInProgress()
                     ? "Needs To Be Approved"
                     : "Publish Stream"}
               </Button>
            )}
            {isDraft && (
               <Button
                  className={classes.button}
                  fullWidth
                  onClick={handleCreateExternalLink}
                  startIcon={<ShareIcon />}
                  variant="outlined"
               >
                  Generate external Link to Edit Draft
               </Button>
            )}
            <Button
               className={classes.button}
               fullWidth
               onClick={() => handleEditStream(livestream)}
               startIcon={<ListAltIcon />}
               variant="outlined"
            >
               {isDraft ? "Edit Draft" : "Edit Stream"}
            </Button>
            {!isDraft && (
               <Button
                  className={classes.button}
                  fullWidth
                  onClick={() => setOpenStreamerLinksDialog(true)}
                  startIcon={<ShareIcon />}
                  variant="outlined"
               >
                  Get Streamer Links
               </Button>
            )}
            <StreamerLinksDialog
               livestreamId={livestream.id}
               openDialog={openStreamerLinksDialog}
               setOpenDialog={setOpenStreamerLinksDialog}
            />
            {(canDownloadRegisteredStudents() || userData?.isAdmin) && (
               <CSVLink
                  data={registeredStudentsFromGroup}
                  separator={";"}
                  filename={
                     "Registered Students " +
                     livestream.company +
                     " " +
                     livestream.id +
                     ".csv"
                  }
                  style={{ color: "red" }}
               >
                  <Button
                     className={classes.button}
                     fullWidth
                     startIcon={<GetAppIcon />}
                     variant="outlined"
                  >
                     Registered Students
                  </Button>
               </CSVLink>
            )}
            <Fragment>
               {!startDownloadingTalentPool || !hasDownloadedTalentPool ? (
                  <div>
                     <Button
                        className={classes.button}
                        fullWidth
                        variant="outlined"
                        onClick={() => setStartDownloadingTalentPool(true)}
                        disabled={startDownloadingTalentPool}
                     >
                        {startDownloadingTalentPool
                           ? "Generating Talent Pool..."
                           : "Generate Talent Pool"}
                     </Button>
                  </div>
               ) : (
                  <CSVLink
                     data={talentPool}
                     separator={";"}
                     filename={
                        "TalentPool " +
                        livestream.company +
                        " " +
                        livestream.id +
                        ".csv"
                     }
                     style={{ color: "red" }}
                  >
                     <Button
                        className={classes.button}
                        fullWidth
                        startIcon={<GetAppIcon />}
                        variant="outlined"
                     >
                        Talent Pool
                     </Button>
                  </CSVLink>
               )}
            </Fragment>
            {isPastLivestream && (
               <Fragment>
                  {!startDownloadingReport || !hasDownloadedReport ? (
                     <div>
                        <Button
                           className={classes.button}
                           fullWidth
                           style={{ color: "white" }}
                           startIcon={
                              startDownloadingReport && (
                                 <CircularProgress size={20} color="inherit" />
                              )
                           }
                           variant="outlined"
                           onClick={() => setStartDownloadingReport(true)}
                           disabled={startDownloadingReport}
                        >
                           {startDownloadingReport
                              ? "Generating Report..."
                              : "Generate Report"}
                        </Button>
                     </div>
                  ) : (
                     <PDFDownloadLink
                        fileName={`General Report ${livestream.company} ${livestream.id}.pdf`}
                        document={
                           <LivestreamPdfReport
                              group={group}
                              livestream={livestream}
                              studentStats={studentStats}
                              speakers={livestream.speakers}
                              overallRating={overallRating}
                              contentRating={contentRating}
                              totalStudentsInTalentPool={
                                 talentPoolForReport.length
                              }
                              totalViewerFromOutsideETH={
                                 participatingStudents.length -
                                 participatingStudentsFromGroup.length
                              }
                              totalViewerFromETH={
                                 participatingStudentsFromGroup.length
                              }
                              questions={questions}
                              polls={polls}
                              icons={icons}
                           />
                        }
                     >
                        {({ blob, url, loading, error }) => (
                           <div>
                              <Button
                                 className={classes.button}
                                 fullWidth
                                 variant="outlined"
                                 color="primary"
                              >
                                 Download Report
                              </Button>
                           </div>
                        )}
                     </PDFDownloadLink>
                  )}
               </Fragment>
            )}
            <Button
               className={classes.button}
               fullWidth
               onClick={handleOPenAreYouSureModal}
               startIcon={<DeleteForeverIcon />}
               variant="outlined"
            >
               {isDraft ? "Delete Draft" : "Delete Stream"}
            </Button>
            <AreYouSureModal
               open={openAreYouSureModal}
               handleClose={handleCloseAreYouSureModal}
               handleConfirm={handleDeleteStream}
               loading={deletingStream}
               message={`Are you sure this ${
                  isDraft ? "draft" : "stream"
               }? you will be no longer able to recover it`}
            />
         </Box>
      </>
   );
};

export default useAdminStreamActions;
