import React, { useCallback, useState } from "react";
import { defaultTableOptions, tableIcons } from "components/util/tableUtils";
import MaterialTable from "@material-table/core";
import { prettyDate } from "../../../../../helperFunctions/HelperFunctions";
import { makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import Speakers from "./Speakers";
import CompanyLogo from "./CompanyLogo";
import AreYouSureModal from "materialUI/GlobalModals/AreYouSureModal";
import StreamerLinksDialog from "../enhanced-group-stream-card/StreamerLinksDialog";
import GetStreamerLinksIcon from "@material-ui/icons/Share";

import { useFirebase } from "context/firebase";

const useStyles = makeStyles((theme) => ({}));
const customOptions = {
   ...defaultTableOptions,
   actionsColumnIndex: 1,
   selection: false,
   pageSize: 10,
   actionsCellStyle: {
      border: "2px solid green",
   },
};

const EventsTable = ({ streams, isDraft, handleEditStream }) => {
   const firebase = useFirebase();
   const [selectedEvents, setSelectedEvents] = useState([]);
   const [targetStreamId, setTargetStreamId] = useState(null);
   const [areYouSureModalOpen, setAreYouSureModalOpen] = useState(false);
   const [publishingDraft, setPublishingDraft] = useState(false);
   const [deletingEvent, setDeletingEvent] = useState(false);
   const [streamIdToBeDeleted, setStreamIdToBeDeleted] = useState(null);
   const [
      targetLivestreamStreamerLinksId,
      setTargetLivestreamStreamerLinksId,
   ] = useState("");
   const classes = useStyles();
   const handleSpeakerSearch = useCallback((term, rowData) => {
      return rowData.speakers.some(
         (speaker) =>
            speaker.firstName.toLowerCase().indexOf(term.toLowerCase()) >= 0 ||
            speaker.lastName.toLowerCase().indexOf(term.toLowerCase()) >= 0
      );
   }, []);

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

   const handleClickDeleteStream = (streamId) => {
      setStreamIdToBeDeleted(streamId);
   };

   return (
      <>
         <MaterialTable
            actions={[
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
