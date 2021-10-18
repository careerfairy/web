import React, { useCallback, useEffect, useState } from "react";
import { defaultTableOptions, tableIcons } from "components/util/tableUtils";
import MaterialTable from "@material-table/core";
import {
   copyStringToClipboard,
   getBaseUrl,
   prettyDate,
} from "../../../../../helperFunctions/HelperFunctions";
import { makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import Speakers from "./Speakers";
import CompanyLogo from "./CompanyLogo";
import AreYouSureModal from "materialUI/GlobalModals/AreYouSureModal";
import StreamerLinksDialog from "../enhanced-group-stream-card/StreamerLinksDialog";
import GetStreamerLinksIcon from "@material-ui/icons/Share";
import PublishIcon from "@material-ui/icons/Publish";
import { useFirebase } from "context/firebase";
import { CircularProgress } from "@material-ui/core";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { useAuth } from "HOCs/AuthProvider";
import DraftLinkIcon from "@material-ui/icons/Link";
import * as actions from "store/actions";
import { useMetaDataActions } from "components/custom-hook/useMetaDataActions";

const useStyles = makeStyles((theme) => ({}));
const customOptions = {
   ...defaultTableOptions,
   actionsColumnIndex: 1,
   selection: false,
   pageSize: 10,
   actionsCellStyle: {
      // border: "2px solid green",
   },
};

const EventsTable = ({
   streams,
   isDraft,
   handleEditStream,
   group,
   publishingDraft,
   handlePublishStream,
   hasAccessToRegisteredStudents,
   isPast,
}) => {
   console.count("-> EventsTable");
   const firebase = useFirebase();
   const { authenticatedUser, userData } = useAuth();
   const [selectedEvents, setSelectedEvents] = useState([]);
   const [deletingEvent, setDeletingEvent] = useState(false);
   const [streamIdToBeDeleted, setStreamIdToBeDeleted] = useState(null);
   const [
      registeredStudentsFromGroup,
      setRegisteredStudentsFromGroup,
   ] = useState([]);
   const [allGroups, setAllGroups] = useState([]);

   const { talentPoolAction, pdfReportAction } = useMetaDataActions({
      allGroups,
      group,
      isPast,
   });
   const [registeredStudents, setRegisteredStudents] = useState([]);

   const dispatch = useDispatch();
   const { push, pathname, asPath } = useRouter();

   const [
      targetLivestreamStreamerLinksId,
      setTargetLivestreamStreamerLinksId,
   ] = useState("");
   const classes = useStyles();

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

   const handleSpeakerSearch = useCallback((term, rowData) => {
      return rowData.speakers.some(
         (speaker) =>
            speaker.firstName.toLowerCase().indexOf(term.toLowerCase()) >= 0 ||
            speaker.lastName.toLowerCase().indexOf(term.toLowerCase()) >= 0
      );
   }, []);

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

   const handleDeleteStream = async () => {
      try {
         setDeletingEvent(true);
         const targetCollection = isDraft ? "draftLivestreams" : "livestreams";
         await firebase.deleteLivestream(streamIdToBeDeleted, targetCollection);
         setDeletingEvent(false);
      } catch (e) {
         setDeletingEvent(false);
         console.log("-> e", e);
      }
      setStreamIdToBeDeleted(null);
   };

   const handleOpenStreamerLinksModal = useCallback((event, rowData) => {
      if (rowData.id) {
         setTargetLivestreamStreamerLinksId(rowData.id);
      }
   }, []);
   const handleCloseStreamerLinksModal = useCallback(() => {
      setTargetLivestreamStreamerLinksId("");
   }, []);

   const handleCreateExternalLink = useCallback(
      (event, rowData) => {
         let baseUrl = getBaseUrl();
         const draftId = rowData.id;
         const targetPath = `${baseUrl}/draft-stream?draftStreamId=${draftId}`;
         copyStringToClipboard(targetPath);
         dispatch(
            actions.enqueueSnackbar({
               message: "Link has been copied to your clipboard!",
               options: {
                  variant: "success",
                  preventDuplicate: true,
                  key: targetPath,
               },
            })
         );
      },
      [dispatch]
   );

   const handleClickDeleteStream = (streamId) => {
      setStreamIdToBeDeleted(streamId);
   };

   return (
      <>
         <MaterialTable
            actions={[
               pdfReportAction,
               talentPoolAction,
               {
                  icon: () => <EditIcon color="action" />,
                  tooltip: isDraft ? "Edit Draft" : "Edit Stream",
                  onClick: (event, rowData) => handleEditStream(rowData),
               },
               {
                  icon: () => <DeleteIcon color="action" />,
                  tooltip: "Delete",
                  onClick: (event, rowData) =>
                     handleClickDeleteStream(rowData.id),
               },
               {
                  icon: () => <GetStreamerLinksIcon color="action" />,
                  tooltip: "Get Streamer Links",
                  onClick: handleOpenStreamerLinksModal,
                  hidden: isDraft,
               },
               (rowData) => ({
                  icon: () =>
                     publishingDraft ? (
                        <CircularProgress size={20} color="inherit" />
                     ) : (
                        <PublishIcon color="action" />
                     ),
                  tooltip: publishingDraft
                     ? "Publishing"
                     : !rowData.status?.pendingApproval
                     ? "Cannot publish yet, click to open and approve event"
                     : "Publish Stream",
                  onClick: !rowData.status?.pendingApproval
                     ? () => handleEditStream(rowData)
                     : () => handlePublishStream(rowData),
                  hidden: !isDraft,
                  disabled: publishingDraft,
               }),
               {
                  icon: () => <DraftLinkIcon color="action" />,
                  tooltip: "Generate external Link to Edit Draft",
                  onClick: handleCreateExternalLink,
                  hidden: !isDraft,
               },
            ]}
            columns={[
               {
                  field: "companyLogoUrl",
                  title: "Logo",
                  searchable: false,
                  filtering: false,
                  export: false,
                  render: (rowData) => (
                     <CompanyLogo src={rowData.companyLogoUrl} />
                  ),
               },
               {
                  field: "title",
                  title: "Title",
                  description: "Title of the event",
               },
               {
                  field: "company",
                  title: "Company",
               },
               {
                  title: "Speakers",
                  render: (rowData) => {
                     return <Speakers speakers={rowData.speakers} />;
                  },
                  customFilterAndSearch: handleSpeakerSearch,
               },
               {
                  field: "date",
                  title: "Date",
                  render: (rowData) => {
                     return prettyDate(rowData.start);
                  },
                  type: "date",
               },
            ]}
            data={streams}
            options={customOptions}
            title={null}
            icons={tableIcons}
            onSelectionChange={(selectedStreams) => {
               setSelectedEvents(selectedStreams);
            }}
         />
         <AreYouSureModal
            open={Boolean(streamIdToBeDeleted)}
            handleClose={() => setStreamIdToBeDeleted(null)}
            handleConfirm={handleDeleteStream}
            loading={deletingEvent}
            message={`Are you sure this ${
               isDraft ? "draft" : "stream"
            }? you will be no longer able to recover it`}
         />
         <StreamerLinksDialog
            livestreamId={targetLivestreamStreamerLinksId}
            openDialog={Boolean(targetLivestreamStreamerLinksId)}
            onClose={handleCloseStreamerLinksModal}
         />
      </>
   );
};

export default EventsTable;

Speakers.propTypes = {
   speakers: PropTypes.arrayOf(
      PropTypes.shape({
         avatar: PropTypes.string,
         background: PropTypes.string,
         firstName: PropTypes.string,
         id: PropTypes.string,
         lastName: PropTypes.string,
         position: PropTypes.string,
      })
   ),
};
