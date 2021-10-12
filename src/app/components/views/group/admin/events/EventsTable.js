import React, { useCallback, useState } from "react";
import { defaultTableOptions, tableIcons } from "components/util/tableUtils";
import MaterialTable from "@material-table/core";
import { prettyDate } from "../../../../helperFunctions/HelperFunctions";
import {
   Avatar,
   Box,
   Collapse,
   Divider,
   IconButton,
   List,
   ListItem,
   ListItemAvatar,
   ListItemText,
   Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import { AvatarGroup } from "@material-ui/lab";
import clsx from "clsx";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

const useStyles = makeStyles((theme) => ({
   avatar: {
      "& img": {},
      boxShadow: theme.shadows[1],
      background: theme.palette.common.white,
   },
   avaGrp: {
      position: "absolute",
   },
   avaGrpBtn: {
      borderRadius: theme.spacing(1),
      padding: theme.spacing(0.5),
   },
   expand: {
      transform: "rotate(0deg)",
      marginLeft: "auto",
      transition: theme.transitions.create("transform", {
         duration: theme.transitions.duration.shortest,
      }),
   },
   expandOpen: {
      transform: "rotate(180deg)",
   },
   speakersList: {},
}));
const customOptions = {
   ...defaultTableOptions,
   selection: false,
};

const Speakers = ({ speakers }) => {
   const [speakersExpanded, setSpeakersExpanded] = useState(false);
   const classes = useStyles();

   const handleToggleExpand = useCallback(
      () => setSpeakersExpanded((prevState) => !prevState),
      []
   );

   return (
      <Box position="relative">
         {!!speakers.length && (
            <>
               <Box width="100%" display="flex" justifyContent="space-between">
                  <AvatarGroup
                     onClick={handleToggleExpand}
                     classeName={classes.avaGrp}
                     max={3}
                  >
                     {speakers.map((speaker) => (
                        <Avatar
                           key={speaker.id}
                           alt={speaker.firstName}
                           src={speaker.avatar}
                        />
                     ))}
                  </AvatarGroup>
                  <IconButton
                     className={clsx(classes.expand, {
                        [classes.expandOpen]: speakersExpanded,
                     })}
                     onClick={handleToggleExpand}
                     aria-expanded={speakersExpanded}
                     aria-label="show more"
                  >
                     <ExpandMoreIcon />
                  </IconButton>
               </Box>
               {speakersExpanded && <Divider />}
               <Collapse in={speakersExpanded}>
                  <Box className={classes.speakersList} dense component={List}>
                     {speakers.map((speaker) => (
                        <ListItem
                           className={classes.root}
                           alignItems="flex-start"
                        >
                           <ListItemAvatar>
                              <Avatar
                                 alt={`${speaker.firstName} ${speaker.lastName}`}
                                 src={speaker.avatar}
                              >
                                 {speaker.firstName
                                    ? `${
                                         speaker.firstName[0] +
                                         speaker.lastName[0]
                                      }`
                                    : ""}
                              </Avatar>
                           </ListItemAvatar>
                           <ListItemText
                              disableTypography
                              primary={
                                 <Typography
                                    noWrap
                                    variant="body1"
                                    className={classes.secondary}
                                 >
                                    {speaker.firstName} {speaker.lastName}
                                 </Typography>
                              }
                              secondary={
                                 <Typography
                                    noWrap
                                    color="textSecondary"
                                    variant="body2"
                                 >
                                    {speaker.position}
                                 </Typography>
                              }
                           />
                        </ListItem>
                     ))}
                  </Box>
               </Collapse>
            </>
         )}
      </Box>
   );
};

const EventsTable = ({ streams }) => {
   const [selectedEvents, setSelectedEvents] = useState([]);
   const classes = useStyles();
   console.log("-> streams", streams);

   return (
      <div>
         <MaterialTable
            style={{
               boxShadow: "none",
            }}
            columns={[
               {
                  field: "companyLogoUrl",
                  title: "Logo",
                  searchable: false,
                  filtering: false,
                  export: false,
                  render: (rowData) => (
                     <Avatar
                        className={classes.avatar}
                        variant="rounded"
                        src={rowData.companyLogoUrl}
                     />
                  ),
               },
               {
                  field: "title",
                  title: "Title",
                  description: "Title of the event",
                  flex: 1,
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
               },
               {
                  field: "date",
                  title: "Date",
                  flex: 0.2,
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
      </div>
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
