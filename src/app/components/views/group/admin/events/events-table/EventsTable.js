import React, { useCallback, useEffect, useMemo, useState } from "react";
import { defaultTableOptions, tableIcons } from "components/util/tableUtils";
import MaterialTable, { MTableAction } from "@material-table/core";
import {
   copyStringToClipboard,
   getBaseUrl,
   getResizedUrl,
   prettyDate,
} from "../../../../../helperFunctions/HelperFunctions";
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
import { Box, CircularProgress } from "@material-ui/core";
import { useDispatch } from "react-redux";
import DraftLinkIcon from "@material-ui/icons/Link";
import { useMetaDataActions } from "components/custom-hook/useMetaDataActions";
import PdfReportDownloadDialog from "../PdfReportDownloadDialog";
import GroupLogos from "./GroupLogos";
import AddBoxIcon from "@material-ui/icons/AddBox";
import ToolbarActionsDialog from "../ToolbarActionsDialog";
import { useTheme } from "@material-ui/core/styles";
import * as storeActions from "store/actions";
import ManageStreamActions from "./ManageStreamActions";
import Button from "@material-ui/core/Button";
import ToolbarDialogAction from "./ToolbarDialogAction";
import { useRouter } from "next/router";

const EventsTable = ({
   streams,
   isDraft,
   handleEditStream,
   group,
   publishingDraft,
   handlePublishStream,
   isPast,
   setGroupsDictionary,
   handleOpenNewStreamModal,
   groupsDictionary,
   eventId,
}) => {
   const firebase = useFirebase();
   const theme = useTheme();
   const { replace, asPath, push } = useRouter();
   const [deletingEvent, setDeletingEvent] = useState(false);
   const [streamIdToBeDeleted, setStreamIdToBeDeleted] = useState(null);
   const [allGroups, setAllGroups] = useState([]);
   const [toolbarActionsDialogOpen, setToolbarActionsDialogOpen] = useState(
      false
   );

   const {
      talentPoolAction,
      pdfReportAction,
      registeredStudentsAction,
      removeReportPdfData,
      reportPdfData,
      setTargetStream,
   } = useMetaDataActions({
      allGroups,
      group,
      isPast,
      isDraft,
   });

   const dispatch = useDispatch();

   const [
      targetLivestreamStreamerLinksId,
      setTargetLivestreamStreamerLinksId,
   ] = useState("");

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
      if (streams?.length) {
         const handleGetGroups = async () => {
            const groupsWithoutData = streams.reduce((acc, currentStream) => {
               const newIdsOfGroupsThatNeedData = [];
               if (currentStream.groupIds.length) {
                  currentStream.groupIds.forEach((groupId) => {
                     if (!groupsDictionary[groupId]) {
                        newIdsOfGroupsThatNeedData.push(groupId);
                     }
                  });
               }
               return acc.concat(newIdsOfGroupsThatNeedData);
            }, []);
            const newGroupLogoDictionary = await firebase.getGroupsInfo([
               ...new Set(groupsWithoutData),
            ]);
            setGroupsDictionary((prevState) => ({
               ...prevState,
               ...newGroupLogoDictionary,
            }));
         };
         handleGetGroups();
      }
   }, [streams]);

   const handleSpeakerSearch = useCallback(
      (term, rowData) =>
         rowData.speakers.some(
            (speaker) =>
               speaker.firstName.toLowerCase().indexOf(term.toLowerCase()) >=
                  0 ||
               speaker.lastName.toLowerCase().indexOf(term.toLowerCase()) >= 0
         ),
      []
   );

   const handleHostsSearch = useCallback(
      (term, rowData) =>
         rowData.groupIds?.some(
            (groupId) =>
               groupsDictionary[groupId]?.universityName
                  ?.toLowerCase()
                  .indexOf(term.toLowerCase()) >= 0
         ),
      [groupsDictionary]
   );
   const handleCompanySearch = useCallback(
      (term, rowData) =>
         rowData.company?.toLowerCase?.().indexOf(term.toLowerCase()) >= 0,
      []
   );

   const handleOpenToolbarActionsDialog = useCallback(() => {
      setToolbarActionsDialogOpen(true);
   }, []);
   const handleCloseToolbarActionsDialog = useCallback(() => {
      setToolbarActionsDialogOpen(false);
   }, []);

   const handleDeleteStream = async () => {
      try {
         setDeletingEvent(true);
         const targetCollection = isDraft ? "draftLivestreams" : "livestreams";
         await firebase.deleteLivestream(streamIdToBeDeleted, targetCollection);
         setDeletingEvent(false);
      } catch (e) {
         setDeletingEvent(false);
      }
      setStreamIdToBeDeleted(null);
   };

   const handleOpenStreamerLinksModal = useCallback((rowData) => {
      if (rowData.id) {
         setTargetLivestreamStreamerLinksId(rowData.id);
      }
   }, []);
   const handleCloseStreamerLinksModal = useCallback(() => {
      setTargetLivestreamStreamerLinksId("");
   }, []);

   const handleCreateExternalLink = useCallback(
      (rowData) => {
         let baseUrl = getBaseUrl();
         const draftId = rowData.id;
         const targetPath = `${baseUrl}/draft-stream?draftStreamId=${draftId}`;
         copyStringToClipboard(targetPath);
         dispatch(
            storeActions.enqueueSnackbar({
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

   const handleClickDeleteStream = useCallback((streamId) => {
      setStreamIdToBeDeleted(streamId);
   }, []);

   const manageStreamActions = useCallback(
      (rowData) => [
         {
            icon: <EditIcon color="action" />,
            tooltip: isDraft ? "Edit Draft Event" : "Edit Event",
            onClick: () => handleEditStream(rowData),
            hintTitle: isDraft ? "Edit Draft Event" : "Edit Event",
            hintDescription:
               "Edit the details of the event like the start date and speakers.",
         },
         pdfReportAction(rowData),
         registeredStudentsAction(rowData),
         talentPoolAction(rowData),
         {
            icon: <GetStreamerLinksIcon color="action" />,
            tooltip: "Get Streamer Links",
            onClick: () => handleOpenStreamerLinksModal(rowData),
            hidden: isDraft,
            hintTitle: "Get Streamer Links",
            hintDescription:
               "Copy your streamer links in your browser URL to access your streaming room. The first link should be use by one person only and all other speakers can use the second link.",
         },
         {
            icon: <DraftLinkIcon color="action" />,
            tooltip: "Generate external Link to Edit Draft",
            onClick: () => handleCreateExternalLink(rowData),
            hidden: !isDraft,
            hintTitle: "Generate external Link to Edit Draft",
            hintDescription:
               "Click here to create an external link that can be shared with a company or non-admin allowing them to edit or fill in the details of the event.",
         },
         {
            icon: <DeleteIcon color="action" />,
            tooltip: isDraft ? "Delete Draft" : "Delete Event",
            onClick: () => handleClickDeleteStream(rowData.id),
            hintTitle: isDraft ? "Delete Draft" : "Delete Event",
            hintDescription:
               "Deleting an event is a permanent action and cannot be undone.",
         },
         {
            icon: publishingDraft ? (
               <CircularProgress size={20} color="inherit" />
            ) : (
               <PublishIcon color="action" />
            ),
            tooltip: publishingDraft
               ? "Publishing"
               : !rowData.status?.pendingApproval
               ? "Needs Approval"
               : "Publish Stream",
            onClick: !rowData.status?.pendingApproval
               ? () => handleEditStream(rowData)
               : () => handlePublishStream(rowData),
            hidden: !isDraft,
            disabled: publishingDraft,
            hintTitle: "Publish Stream",
            hintDescription:
               "Once you are happy with the contents of the drafted event, you can then make it live so that users can now register.",
         },
      ],
      [
         registeredStudentsAction,
         pdfReportAction,
         talentPoolAction,
         handleCreateExternalLink,
         handleOpenStreamerLinksModal,
         handleClickDeleteStream,
         handleCreateExternalLink,
         handleOpenStreamerLinksModal,
         handleClickDeleteStream,
         streams,
         isDraft,
      ]
   );

   const actions = useMemo(
      () => [
         {
            position: "toolbar",
            icon: () => <AddBoxIcon fontSize="large" color="primary" />,
            onClick: handleOpenToolbarActionsDialog,
            tooltip: "Other options",
         },
      ],
      [streams]
   );

   const columns = useMemo(
      () => [
         {
            field: "backgroundImageUrl",
            title: "Logo",
            cellStyle: (backgroundImageUrl) => ({
               padding: 0,
               height: 70,
               boxShadow: theme.shadows[2],
               backgroundImage:
                  backgroundImageUrl &&
                  `url(${getResizedUrl(backgroundImageUrl, "xs")})`,
               backgroundSize: "cover",
               backgroundRepeat: "no-repeat",
            }),
            export: false,
            customFilterAndSearch: handleCompanySearch,
            render: (rowData) => (
               <CompanyLogo
                  onClick={() => handleEditStream(rowData)}
                  livestream={rowData}
               />
            ),
         },
         {
            title: "Options",
            description: "Title of the event",
            render: (rowData) => (
               <ManageStreamActions
                  rowData={rowData}
                  isHighlighted={rowData?.id === eventId}
                  setTargetStream={setTargetStream}
                  actions={manageStreamActions(rowData)}
               />
            ),
         },
         {
            field: "date",
            title: "Event Date",
            render: (rowData) => {
               return prettyDate(rowData.start);
            },
            type: "date",
         },
         {
            field: "title",
            title: "Title",
            description: "Title of the event",
         },
         {
            field: "registeredUsers.length",
            title: "Total Registrations",
            description: "Total registrations for the event",
            type: "numeric",
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
            title: "Host(s)",
            render: (rowData) => {
               return (
                  <GroupLogos
                     groupIds={rowData.groupIds}
                     groupsDictionary={groupsDictionary}
                  />
               );
            },
            customFilterAndSearch: handleHostsSearch,
         },
      ],
      [
         handleSpeakerSearch,
         streams,
         groupsDictionary,
         handleHostsSearch,
         eventId,
         handleEditStream,
         manageStreamActions,
      ]
   );

   const customOptions = useMemo(
      () => ({
         ...defaultTableOptions,
         actionsColumnIndex: 1,
         selection: false,
         pageSize: 5,
         actionsCellStyle: {},
         rowStyle: (rowData) => {
            if (rowData.id === eventId) {
               return { border: `5px solid ${theme.palette.primary.main}` };
            }
            return {};
         },
      }),
      [eventId]
   );
   const handleRemoveEventId = () => {
      if (eventId) {
         push(
            asPath,
            {
               query: { eventId: null },
            },
            { shallow: true }
         );
      }
   };

   return (
      <>
         <Box onClick={handleRemoveEventId}>
            <MaterialTable
               actions={actions}
               columns={columns}
               data={streams}
               components={{
                  Action: (props) => {
                     return props?.action?.tooltip === "Other options" ? (
                        <ToolbarDialogAction {...props.action} />
                     ) : (
                        <MTableAction {...props} />
                     );
                  },
               }}
               options={customOptions}
               title={null}
               icons={tableIcons}
            />
         </Box>
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
         <PdfReportDownloadDialog
            openDialog={Boolean(reportPdfData)}
            onClose={removeReportPdfData}
            reportPdfData={reportPdfData}
         />
         <ToolbarActionsDialog
            group={group}
            onClose={handleCloseToolbarActionsDialog}
            openDialog={toolbarActionsDialogOpen}
            handleOpenNewStreamModal={handleOpenNewStreamModal}
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
