import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { Button, Card, Slide, Tab, Tabs } from "@material-ui/core";
import { withFirebase } from "../../../../../../../context/firebase";
import {
   copyStringToClipboard,
   prettyDate,
   prettyLocalizedDate,
   toTitleCase,
} from "../../../../../../helperFunctions/HelperFunctions";
import { useSnackbar } from "notistack";
import MaterialTable from "material-table";
import {
   defaultTableOptions,
   exportSelectionAction,
   LinkifyText,
   tableIcons,
} from "../../common/TableUtils";
import UserInnerTable from "./UserInnerTable";
import { useAuth } from "../../../../../../../HOCs/AuthProvider";
import { makeStyles } from "@material-ui/core/styles";
import AnalyticsUtil from "../../../../../../../data/util/AnalyticsUtil";
import { useDispatch, useSelector } from "react-redux";
import StatsUtil from "../../../../../../../data/util/StatsUtil";
import GroupsUtil from "../../../../../../../data/util/GroupsUtil";
import { universityCountriesMap } from "../../../../../../util/constants/universityCountries";
import PDFIcon from "@material-ui/icons/PictureAsPdf";
import Link from "materialUI/NextNavLink";
import JSZip from "jszip";
import * as actions from "store/actions";

const customTableOptions = { ...defaultTableOptions };
const useStyles = makeStyles((theme) => ({
   root: {},
   actions: {
      justifyContent: "flex-end",
   },
   avatar: {
      height: 70,
      width: "80%",
      "& img": {
         objectFit: "contain",
      },
      boxShadow: theme.shadows[1],
   },
   streamManage: {
      background: theme.palette.navyBlue.main,
      color: theme.palette.common.white,
   },
}));

const UsersTable = ({
   groupOptions,
   fetchingStreams,
   userType,
   currentStream,
   group,
   firebase,
   setUserType,
   futureStreams,
   isFollowers,
   handleReset,
   currentUserDataSet,
   totalUniqueUsers,
   streamsFromTimeFrameAndFuture,
   breakdownRef,
   userTypes,
   className,
   ...rest
}) => {
   const dataTableRef = useRef(null);
   const { userData } = useAuth();
   const classes = useStyles();
   const [selection, setSelection] = useState([]);
   const { enqueueSnackbar } = useSnackbar();
   const [users, setUsers] = useState([]);
   const [targetGroups, setTargetGroups] = useState([]);
   const [processingCVs, setProcessingCVs] = useState(false);
   const dispatch = useDispatch();

   const categoryFields = () => {
      const arrayOfGroups = targetGroups.length ? targetGroups : [group];
      const tableFieldsMap = arrayOfGroups.reduce((acc, { categories }) => {
         if (categories?.length) {
            categories.forEach(({ name, options }) => {
               const categoryKey = name.toLowerCase();
               const newOptions = options.map(({ name }) => name.toLowerCase());
               const uniqueOptions = acc[categoryKey]
                  ? [...new Set(acc[categoryKey].concat(newOptions))]
                  : newOptions;
               acc[categoryKey] = uniqueOptions.map((name) =>
                  toTitleCase(name)
               );
            });
         }
         return acc;
      }, {});
      return Object.keys(tableFieldsMap).map((key) => {
         const titledLabel = toTitleCase(key);
         const lookup = tableFieldsMap[key].reduce(
            (acc, curr) => {
               acc[curr] = curr;
               return acc;
            },
            { "": "none" }
         );
         return {
            field: titledLabel,
            title: titledLabel,
            lookup,
         };
      });
   };

   const allGroupsMap = useSelector(
      (state) => state.firestore.data?.allGroups || {}
   );

   useEffect(() => {
      let newTargetGroups = [];
      if (
         currentUserDataSet.dataSet === "followers" &&
         currentStream?.groupIds?.length > 1
      ) {
         newTargetGroups = currentStream.groupIds.map((groupId) => ({
            ...allGroupsMap[groupId],
            options: GroupsUtil.handleFlattenOptions(allGroupsMap[groupId]),
         }));
      }
      setTargetGroups(newTargetGroups);
   }, [currentUserDataSet, currentStream?.groupIds]);

   useEffect(() => {
      let newUsers;
      if (targetGroups.length) {
         newUsers =
            totalUniqueUsers?.map((user) => {
               const relevantGroup = StatsUtil.getFirstGroupThatUserBelongsTo(
                  user,
                  targetGroups,
                  group
               );
               return AnalyticsUtil.mapUserEngagement(
                  user,
                  streamsFromTimeFrameAndFuture,
                  relevantGroup || group,
                  group
               );
            }) || [];
      } else {
         newUsers =
            totalUniqueUsers?.map((user) => {
               return AnalyticsUtil.mapUserEngagement(
                  user,
                  streamsFromTimeFrameAndFuture,
                  group
               );
            }) || [];
      }
      setUsers(newUsers);
      setSelection([]);
   }, [totalUniqueUsers, targetGroups]);

   useEffect(() => {
      if (dataTableRef.current) {
         dataTableRef.current.onAllSelected(false);
      }
   }, [currentStream?.id]);

   const handleCopyEmails = () => {
      const emails = selection.map((user) => user.id).join(";");
      copyStringToClipboard(emails);
      enqueueSnackbar("Emails have been copied!", {
         variant: "success",
      });
   };

   const handleCopyLinkedin = () => {
      const linkedInAddresses = selection
         .filter((user) => user.linkedinUrl)
         .map((user) => user.linkedinUrl)
         .join(",");
      if (linkedInAddresses?.length) {
         copyStringToClipboard(linkedInAddresses);
         enqueueSnackbar("LinkedIn addresses have been copied!", {
            variant: "success",
         });
      } else {
         enqueueSnackbar("None of your selections have linkedIn Addresses", {
            variant: "warning",
         });
      }
   };

   const handleMenuItemClick = (event, index) => {
      setUserType(userTypes[index]);
   };

   const handleDownload = async ({ url, fileName }) => {
      return fetch(url)
         .then((resp) => resp.arrayBuffer())
         .then((resp) => {
            // set the blog type to final pdf
            const file = new Blob([resp], { type: "application/pdf" });
            // process to auto download it
            const fileURL = URL.createObjectURL(file);
            const link = document.createElement("a");
            link.href = fileURL;
            link.download = fileName + new Date() + ".pdf";
            link.click();
         });
   };

   const handleDownloadCVs = async () => {
      const cvUrls = selection
         .filter((user) => user.userResume)
         .map((user) => ({
            url: user.userResume,
            fileName: getFileName(user),
         }));
      await batch(cvUrls);
   };

   const makefileNameWindowsFriendly = (string) => {
      return string.replace(/[\/\*\|\:\<\>\?\"\\]/gi, "_");
   };
   //
   const batch = async (arrayOfDownloadData) => {
      try {
         setProcessingCVs(true);
         const zip = new JSZip();
         const linkElement = document.createElement("a");

         function request({ url, fileName }) {
            return fetch(url)
               .then((resp) => resp.arrayBuffer())
               .then((resp) => {
                  // set the blog type to final pdf
                  const file = new Blob([resp], { type: "application/pdf" });
                  // process to auto download it
                  // const fileURL = URL.createObjectURL(file);
                  zip.file(
                     `${makefileNameWindowsFriendly(fileName)}.pdf`,
                     file
                  );
               });
         }

         await Promise.all(
            arrayOfDownloadData.map((data) => {
               return request(data);
            })
         ).then(function () {
            zip.generateAsync({
               type: "blob",
            }).then(function (content) {
               const title = `CVs of ${userType.displayName} ${getTitle()}`;
               linkElement.download = makefileNameWindowsFriendly(title);
               linkElement.href = URL.createObjectURL(content);
               linkElement.innerHTML = "download " + linkElement.download;
               linkElement.click();
            });
         });
      } catch (e) {
         dispatch(actions.sendGeneralError(e));
      }
      setProcessingCVs(false);
   };
   const getTitle = () =>
      currentStream
         ? `For ${currentStream.company} on ${prettyDate(currentStream.start)}`
         : "For all Events";

   const getFileName = (userData) =>
      `${userData.firstName} ${userData.lastName} CV - ${prettyLocalizedDate(
         new Date()
      )}`;

   const dataPrivacyTab = !userTypes.find(
      ({ propertyName }) => propertyName === "registeredUsers"
   ) && (
      <Tab
         href={`/group/${group.id}/admin/edit#privacy-policy`}
         component={Link}
         label={`Click here to activate your privacy to see users ${
            group?.universityCode ? "outside of your university" : ""
         }`}
      />
   );

   return (
      <Slide direction="up" unmountOnExit mountOnEnter in={true}>
         <Card
            raised={Boolean(currentStream)}
            className={clsx(classes.root, className)}
            ref={breakdownRef}
            {...rest}
         >
            <Tabs
               value={userType.propertyName}
               indicatorColor="primary"
               textColor="primary"
               scrollButtons="auto"
               aria-label="disabled tabs example"
            >
               {userTypes.map(({ displayName, propertyName }, index) => (
                  <Tab
                     key={propertyName}
                     value={propertyName}
                     onClick={(event) => handleMenuItemClick(event, index)}
                     label={displayName}
                  />
               ))}
               {dataPrivacyTab}
            </Tabs>
            <MaterialTable
               icons={tableIcons}
               tableRef={dataTableRef}
               isLoading={fetchingStreams || processingCVs}
               data={users}
               options={customTableOptions}
               columns={[
                  {
                     field: "firstName",
                     title: "First Name",
                  },
                  {
                     field: "lastName",
                     title: "Last Name",
                  },
                  {
                     field: "university.name",
                     title: "University",
                  },
                  {
                     field: "universityCountryCode",
                     title: "University Country",
                     lookup: universityCountriesMap,
                  },
                  ...categoryFields().map((e) => e),
                  {
                     field: "numberOfStreamsWatched",
                     title: "Events Attended",
                     type: "numeric",
                  },
                  {
                     field: "numberOfStreamsRegistered",
                     title: "Events Registered To",
                     type: "numeric",
                  },
                  {
                     field: "userResume",
                     title: "CV",
                     type: "boolean",
                     searchable: false,
                     render: (rowData) =>
                        rowData.userResume ? (
                           <Button
                              size="small"
                              startIcon={<PDFIcon />}
                              onClick={() =>
                                 handleDownload({
                                    url: rowData.userResume,
                                    fileName: getFileName(rowData),
                                 })
                              }
                              variant="contained"
                              color="primary"
                           >
                              Download
                           </Button>
                        ) : null,
                     cellStyle: {
                        width: 300,
                     },
                  },
                  {
                     field: "userEmail",
                     title: "Email",
                     render: ({ id }) => <a href={`mailto:${id}`}>{id}</a>,
                     cellStyle: {
                        width: 300,
                     },
                  },
                  {
                     field: "linkedinUrl",
                     title: "LinkedIn",
                     render: (rowData) => LinkifyText(rowData.linkedinUrl),
                     cellStyle: {
                        width: 300,
                     },
                  },

                  {
                     field: "watchedEvent",
                     title: "Attended Event",
                     type: "boolean",
                     width: 170,
                     export: Boolean(currentStream),
                     hidden: Boolean(!currentStream),
                  },
               ]}
               detailPanel={[
                  ({
                     numberOfStreamsRegistered,
                     streamsRegistered,
                     firstName,
                     lastName,
                  }) => ({
                     icon: tableIcons.LibraryAddOutlinedIcon,
                     openIcon: tableIcons.AddToPhotosIcon,
                     tooltip:
                        !(numberOfStreamsRegistered === 0) &&
                        `See streams ${firstName} registered to`,
                     disabled: numberOfStreamsRegistered === 0,
                     render: () => (
                        <UserInnerTable
                           firstName={firstName}
                           lastName={lastName}
                           group={group}
                           streams={streamsRegistered}
                           firebase={firebase}
                           registered
                        />
                     ),
                  }),
                  ({
                     numberOfStreamsWatched,
                     streamsWatched,
                     firstName,
                     lastName,
                  }) => ({
                     icon: tableIcons.VideoLibraryOutlinedIcon,
                     openIcon: tableIcons.VideoLibraryIcon,
                     tooltip:
                        !(numberOfStreamsWatched === 0) &&
                        `See streams ${firstName} watched`,
                     disabled: numberOfStreamsWatched === 0,
                     render: () => (
                        <UserInnerTable
                           firstName={firstName}
                           lastName={lastName}
                           firebase={firebase}
                           group={group}
                           streams={streamsWatched}
                        />
                     ),
                  }),
               ]}
               actions={[
                  exportSelectionAction(
                     dataTableRef?.current?.props?.columns || [],
                     getTitle()
                  ),
                  (rowData) => ({
                     tooltip:
                        !(
                           (rowData.length === 0)
                           // || !isTalentPool()
                        ) && "Copy Emails",
                     position: "toolbarOnSelect",
                     icon: tableIcons.EmailIcon,
                     disabled: rowData.length === 0,
                     // || !isTalentPool()
                     onClick: handleCopyEmails,
                  }),
                  (rowData) => ({
                     tooltip:
                        !(
                           (rowData.length === 0)
                           // || !isTalentPool()
                        ) && "Copy LinkedIn Addresses",
                     position: "toolbarOnSelect",
                     icon: tableIcons.LinkedInIcon,
                     disabled: rowData.length === 0,
                     // || !isTalentPool()
                     onClick: handleCopyLinkedin,
                  }),
                  (rowData) => ({
                     tooltip:
                        !(
                           (rowData.length === 0)
                           // || !isTalentPool()
                        ) && "Download CVs",
                     position: "toolbarOnSelect",
                     icon: tableIcons.PictureAsPdfIcon,
                     disabled: rowData.length === 0 || processingCVs,
                     onClick: handleDownloadCVs,
                  }),
                  {
                     disabled: !Boolean(currentStream),
                     tooltip: currentStream && "Set back to overall",
                     isFreeAction: true,
                     icon: tableIcons.RotateLeftIcon,
                     hidden: !Boolean(currentStream),
                     onClick: handleReset,
                  },
               ]}
               onSelectionChange={(rows) => {
                  setSelection(rows);
               }}
               title={getTitle()}
            />
         </Card>
      </Slide>
   );
};
UsersTable.propTypes = {
   className: PropTypes.string,
};

export default withFirebase(UsersTable);
