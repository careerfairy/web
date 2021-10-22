import React, { useCallback, useEffect, useMemo, useState } from "react";
import { defaultTableOptions, tableIcons } from "components/util/tableUtils";
import MaterialTable from "@material-table/core";
import {
   copyStringToClipboard,
   getBaseUrl,
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
import { CircularProgress } from "@material-ui/core";
import { useDispatch } from "react-redux";
import DraftLinkIcon from "@material-ui/icons/Link";
import { useMetaDataActions } from "components/custom-hook/useMetaDataActions";
import PdfReportDownloadDialog from "../PdfReportDownloadDialog";
import GroupLogos from "./GroupLogos";
import AddBoxIcon from "@material-ui/icons/AddBox";
import ToolbarActionsDialog from "../ToolbarActionsDialog";
import { useTheme } from "@material-ui/core/styles";
import * as storeActions from "store/actions";

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

   const handleSpeakerSearch = useCallback((term, rowData) => {
      return rowData.speakers.some(
         (speaker) =>
            speaker.firstName.toLowerCase().indexOf(term.toLowerCase()) >= 0 ||
            speaker.lastName.toLowerCase().indexOf(term.toLowerCase()) >= 0
      );
   }, []);
   const handleHostsSearch = useCallback(
      (term, rowData) => {
         return rowData.groupIds?.some(
            (groupId) =>
               groupsDictionary[groupId]?.universityName
                  ?.toLowerCase()
                  .indexOf(term.toLowerCase()) >= 0
         );
      },
      [groupsDictionary]
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

   const actions = useMemo(
      () => [
         {
            position: "toolbar",
            icon: () => <AddBoxIcon fontSize="large" color="primary" />,
            onClick: handleOpenToolbarActionsDialog,
         },
         pdfReportAction,
         registeredStudentsAction,
         talentPoolAction,
         {
            icon: () => <EditIcon color="action" />,
            tooltip: isDraft ? "Edit Draft" : "Edit Stream",
            onClick: (event, rowData) => handleEditStream(rowData),
         },
         {
            icon: () => <DeleteIcon color="action" />,
            tooltip: "Delete",
            onClick: (event, rowData) => handleClickDeleteStream(rowData.id),
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
      ],
      [
         registeredStudentsAction,
         pdfReportAction,
         talentPoolAction,
         handleCreateExternalLink,
         handleOpenStreamerLinksModal,
         handleClickDeleteStream,
         streams,
      ]
   );

   const columns = useMemo(
      () => [
         {
            field: "companyLogoUrl",
            title: "Logo",
            sorting: false,
            searchable: false,
            filtering: false,
            export: false,
            render: (rowData) => (
               <CompanyLogo
                  withBackground
                  onClick={() => handleEditStream(rowData)}
                  src={rowData.companyLogoUrl}
               />
            ),
         },
         {
            field: "backgroundImageUrl",
            title: "Thumbnail / Illustration",
            sorting: false,
            searchable: false,
            filtering: false,
            export: false,
            render: (rowData) => (
               <CompanyLogo
                  onClick={() => handleEditStream(rowData)}
                  src={rowData.backgroundImageUrl}
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

   return (
      <>
         <MaterialTable
            actions={actions}
            columns={columns}
            data={streams}
            options={customOptions}
            title={null}
            icons={tableIcons}
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
