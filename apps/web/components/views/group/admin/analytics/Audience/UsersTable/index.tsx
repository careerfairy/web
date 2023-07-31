import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button, Card, Slide, Tab, Tabs } from "@mui/material"
import {
   copyStringToClipboard,
   prettyDate,
   prettyLocalizedDate,
} from "../../../../../../helperFunctions/HelperFunctions"
import { useSnackbar } from "notistack"

import { tableIcons } from "../../common/TableUtils"
import AnalyticsUtil from "../../../../../../../data/util/AnalyticsUtil"
import { useDispatch, useSelector } from "react-redux"
import { universityCountriesMap } from "../../../../../../util/constants/universityCountries"
import PDFIcon from "@mui/icons-material/PictureAsPdf"
import Link from "../../../../../common/Link"
import JSZip from "jszip"
import * as actions from "store/actions"
import ExportTable from "../../../../../common/Tables/ExportTable"
import { CSVDialogDownload } from "../../../../../../custom-hook/useMetaDataActions"
import { exportSelectionAction } from "../../../../../../util/tableUtils"
import { useGroupAnalytics } from "../../../../../../../HOCs/GroupAnalyticsProvider"
import { RootState } from "../../../../../../../store"
import { useGroup } from "../../../../../../../layouts/GroupDashboardLayout"
import { UserDataSet, UserType } from "../../index"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import LinkifyText from "../../../../../../util/LinkifyText"
import { Identifiable } from "../../../../../../../types/commonTypes"
import { createLookup } from "@careerfairy/shared-lib/utils"

interface Props {
   currentUserDataSet: UserDataSet
   fetchingStreams: boolean
   userType: UserType
   currentStream: LivestreamEvent
   setUserType: (userType: UserType) => void
   handleReset: () => void
   totalUniqueUsers: UserData[]
   streamsFromTimeFrameAndFuture: LivestreamEvent[]
   breakdownRef: React.RefObject<HTMLDivElement>
   userTypes: UserType[]
}

const UsersTable = ({
   fetchingStreams,
   userType,
   currentStream,
   setUserType,
   handleReset,
   totalUniqueUsers,
   streamsFromTimeFrameAndFuture,
   breakdownRef,
   userTypes,
   currentUserDataSet,
}: Props) => {
   const showUniversityBreakdown =
      currentUserDataSet.dataSet === "groupUniversityStudents"
   const { fieldsOfStudy, levelsOfStudy } = useGroupAnalytics()
   const { groupQuestions, groupPresenter, group } = useGroup()
   const dataTableRef = useRef(null)
   const [selection, setSelection] = useState([])
   const { enqueueSnackbar } = useSnackbar()
   const [users, setUsers] = useState([])
   const [processingCVs, setProcessingCVs] = useState(false)
   const hiddenStreamIds = useSelector(
      (state: RootState) => state.analyticsReducer.hiddenStreamIds
   )
   const noOfVisibleStreamIds = useSelector(
      (state: RootState) => state.analyticsReducer.visibleStreamIds?.length || 0
   )
   const dispatch = useDispatch()
   const categoryFields = useMemo(() => {
      if (showUniversityBreakdown) {
         return groupPresenter.getUniversityQuestionsForTable(groupQuestions)
      } else {
         return [
            {
               field: "fieldOfStudy.id",
               title: "Field of Study",
               lookup: createLookup(fieldsOfStudy, "name"),
            },
            {
               field: "levelOfStudy.id",
               title: "Level of Study",
               lookup: createLookup(levelsOfStudy, "name"),
            },
         ]
      }
   }, [showUniversityBreakdown, groupQuestions])

   useEffect(() => {
      let newUsers
      newUsers =
         totalUniqueUsers?.map((user) =>
            AnalyticsUtil.mapUserEngagement(user, streamsFromTimeFrameAndFuture)
         ) || []
      setUsers(newUsers)
      setSelection([])
   }, [totalUniqueUsers])

   useEffect(() => {
      if (dataTableRef.current) {
         dataTableRef.current.onAllSelected(false)
      }
   }, [currentStream?.id])

   const handleCopyEmails = () => {
      const emails = selection.map((user) => user.id).join(";")
      copyStringToClipboard(emails)
      enqueueSnackbar("Emails have been copied!", {
         variant: "success",
      })
   }

   const handleCopyLinkedin = () => {
      const linkedInAddresses = selection
         .filter((user) => user.linkedinUrl)
         .map((user) => user.linkedinUrl)
         .join(",")
      if (linkedInAddresses?.length) {
         copyStringToClipboard(linkedInAddresses)
         enqueueSnackbar("LinkedIn addresses have been copied!", {
            variant: "success",
         })
      } else {
         enqueueSnackbar("None of your selections have linkedIn Addresses", {
            variant: "warning",
         })
      }
   }

   const handleMenuItemClick = (event, index) => {
      setUserType(userTypes[index])
   }

   const handleDownload = async ({ url, fileName }) => {
      return fetch(url)
         .then((resp) => resp.arrayBuffer())
         .then((resp) => {
            // set the blog type to final pdf
            const file = new Blob([resp], { type: "application/pdf" })
            // process to auto download it
            const fileURL = URL.createObjectURL(file)
            const link = document.createElement("a")
            link.href = fileURL
            link.download = fileName + new Date() + ".pdf"
            link.click()
         })
   }

   const handleDownloadCVs = async () => {
      const cvUrls = selection
         .filter((user) => user.userResume)
         .map((user) => ({
            url: user.userResume,
            fileName: getFileName(user),
         }))
      await batch(cvUrls)
   }

   const makefileNameWindowsFriendly = (string) => {
      return string.replace(/[\/\*\|\:\<\>\?\"\\]/gi, "_")
   }
   //
   const batch = async (arrayOfDownloadData) => {
      try {
         setProcessingCVs(true)
         const zip = new JSZip()
         const linkElement = document.createElement("a")

         const request = ({ url, fileName }) =>
            fetch(url)
               .then((resp) => resp.arrayBuffer())
               .then((resp) => {
                  // set the blog type to final pdf
                  const file = new Blob([resp], { type: "application/pdf" })
                  // process to auto download it
                  // const fileURL = URL.createObjectURL(file);
                  zip.file(`${makefileNameWindowsFriendly(fileName)}.pdf`, file)
               })

         await Promise.all(
            arrayOfDownloadData.map((data) => {
               return request(data)
            })
         ).then(function () {
            zip.generateAsync({
               type: "blob",
            }).then(function (content) {
               const title = `CVs of ${userType.displayName} ${getTitle()}`
               linkElement.download = makefileNameWindowsFriendly(title)
               linkElement.href = URL.createObjectURL(content)
               linkElement.innerHTML = "download " + linkElement.download
               linkElement.click()
            })
         })
      } catch (e) {
         dispatch(actions.sendGeneralError(e))
      }
      setProcessingCVs(false)
   }
   const getTitle = () =>
      currentStream
         ? `For ${currentStream.company} on ${prettyDate(currentStream.start)}`
         : hiddenStreamIds
         ? `For the ${noOfVisibleStreamIds} selected events`
         : "For all events"

   const getFileName = (userData) =>
      `${userData.firstName} ${userData.lastName} CV - ${prettyLocalizedDate(
         new Date()
      )}`
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
   )

   const [csvDownloadData, setCsvDownloadData] = useState(null)

   const handleCloseCsvDialog = useCallback(() => {
      setCsvDownloadData(null)
   }, [])

   return (
      <>
         <Slide direction="up" unmountOnExit mountOnEnter in={true}>
            <Card raised={Boolean(currentStream)} ref={breakdownRef}>
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
               <ExportTable
                  icons={tableIcons}
                  tableRef={dataTableRef}
                  isLoading={fetchingStreams || processingCVs}
                  data={users}
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

                     ...categoryFields,
                     {
                        field: "numberOfStreamsWatched",
                        title: "Events Attended",
                        type: "numeric",
                     },
                     {
                        field: "isInTalentPool",
                        title: "Is In TalentPool",
                        type: "boolean",
                        hidden: Boolean(
                           userType.propertyName === "talentPool" ||
                              !currentStream
                        ),
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
                        render: (rowData) => (
                           <LinkifyText>{rowData.linkedinUrl}</LinkifyText>
                        ),
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
                  actions={[
                     exportSelectionAction(
                        dataTableRef?.current?.props?.columns || [],
                        getTitle(),
                        setCsvDownloadData
                     ),
                     (rowData) => ({
                        tooltip: !(rowData.length === 0) && "Copy Emails",
                        position: "toolbarOnSelect",
                        icon: tableIcons.EmailIcon,
                        disabled: rowData.length === 0,
                        onClick: handleCopyEmails,
                     }),
                     (rowData) => ({
                        tooltip:
                           !(rowData.length === 0) && "Copy LinkedIn Addresses",
                        position: "toolbarOnSelect",
                        icon: tableIcons.LinkedInIcon,
                        disabled: rowData.length === 0,
                        onClick: handleCopyLinkedin,
                     }),
                     (rowData) => ({
                        tooltip: !(rowData.length === 0) && "Download CVs",
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
                     setSelection(rows)
                  }}
                  title={getTitle()}
               />
            </Card>
         </Slide>
         <CSVDialogDownload
            title={csvDownloadData?.title}
            data={csvDownloadData?.data}
            filename={`${csvDownloadData?.filename}.csv`}
            defaultOpen={!!csvDownloadData}
            onClose={handleCloseCsvDialog}
         />
      </>
   )
}

export default UsersTable
