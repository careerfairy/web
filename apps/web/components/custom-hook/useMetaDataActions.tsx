import StatsUtil from "data/util/StatsUtil"
import React, { FC, useCallback, useEffect, useState } from "react"
import TalentPoolIcon from "@mui/icons-material/HowToRegRounded"
import { useFirebaseService } from "../../context/firebase/FirebaseServiceContext"
import {
   Button,
   CircularProgress,
   Dialog,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
} from "@mui/material"
import { CSVLink } from "react-csv"
import GetAppIcon from "@mui/icons-material/GetApp"
import PDFIcon from "@mui/icons-material/PictureAsPdf"
import { useAuth } from "../../HOCs/AuthProvider"
import RegisteredUsersIcon from "@mui/icons-material/People"
import * as actions from "store/actions"
import { useDispatch } from "react-redux"
import ButtonWithHint from "../views/group/admin/events/events-table/ButtonWithHint"
import { useTheme } from "@mui/material/styles"
import { getCSVDelimiterBasedOnOS } from "../../util/CommonUtil"
import { Group } from "@careerfairy/shared-lib/dist/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { RegisteredStudent, UserData } from "@careerfairy/shared-lib/dist/users"
import { mapFirestoreDocuments } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import { PdfReportData } from "@careerfairy/shared-lib/dist/groups/pdf-report"
import { livestreamRepo } from "../../data/RepositoryInstances"
import { useGroup } from "../../layouts/GroupDashboardLayout"

interface MetaDataActionsProps {
   allGroups: Group[]
   group: Group
   isPast: boolean
   isDraft: boolean
}

const isLegacyStream = (stream: LivestreamEvent) => false // TODO: legacy stream
// stream.start.toDate() < new Date(2022, 7, 18)

export function useMetaDataActions({
   allGroups,
   group,
   isPast,
   isDraft,
}: MetaDataActionsProps) {
   const { groupPresenter, groupQuestions } = useGroup()
   const firebase = useFirebaseService()
   const { userData } = useAuth()
   const theme = useTheme()
   const dispatch = useDispatch()
   const [talentPoolDictionary, setTalentPoolDictionary] = useState({})
   const [targetStream, setTargetStream] = useState<LivestreamEvent>(null)
   const [loadingReportData, setLoadingReportData] = useState({})
   const [
      loadingRegisteredUsersFromGroupData,
      setLoadingRegisteredUsersFromGroupData,
   ] = useState<Record<string, boolean>>({})
   const [loadingTalentPool, setLoadingTalentPool] = useState({})

   const [
      registeredStudentsFromGroupDictionary,
      setRegisteredStudentsFromGroupDictionary,
   ] = useState({})
   const [reportDataDictionary, setReportDataDictionary] = useState<
      Record<string, PdfReportData>
   >({})
   const [reportPdfData, setReportPdfData] = useState<PdfReportData>(null)

   const [registeredStudentsDictionary, setRegisteredStudentsDictionary] =
      useState({})

   const removeReportPdfData = useCallback(() => {
      setReportPdfData(null)
   }, [])

   useEffect(() => {
      ;(function handleGetRegisteredUsersFromGroup() {
         try {
            if (!targetStream?.id) return
            const targetRegisteredStudents =
               registeredStudentsDictionary[targetStream?.id]
            setLoadingRegisteredUsersFromGroupData((prevState) => ({
               ...prevState,
               [targetStream.id]: true,
            }))
            if (
               targetRegisteredStudents &&
               targetRegisteredStudents.length &&
               !registeredStudentsFromGroupDictionary?.[targetStream.id]
            ) {
               let users = targetRegisteredStudents
               if (group.universityCode) {
                  users = targetRegisteredStudents.filter((user) =>
                     groupPresenter.isUniversityStudent(user)
                  )
               }

               const csvData = StatsUtil.getCsvData(
                  group,
                  targetStream,
                  users,
                  groupQuestions
               )

               setRegisteredStudentsFromGroupDictionary({
                  ...registeredStudentsFromGroupDictionary,
                  [targetStream.id]: csvData,
               })
            }
         } catch (e) {
            dispatch(actions.sendGeneralError(e))
         }
         setLoadingRegisteredUsersFromGroupData((prevState) => ({
            ...prevState,
            [targetStream.id]: false,
         }))
      })()
   }, [registeredStudentsDictionary, targetStream, group, groupQuestions])

   useEffect(() => {
      if (
         targetStream &&
         group &&
         !registeredStudentsDictionary?.[targetStream?.id]
      ) {
         ;(async function () {
            const querySnapshot =
               await firebase.getLivestreamRegisteredStudents(targetStream.id)
            const newRegisteredStudents =
               mapFirestoreDocuments<RegisteredStudent>(querySnapshot)

            setRegisteredStudentsDictionary({
               ...registeredStudentsDictionary,
               [targetStream.id]: newRegisteredStudents,
            })
         })()
      }
   }, [targetStream, group])

   useEffect(() => {
      if (targetStream) {
         ;(async function () {
            setLoadingTalentPool((prevState) => ({
               ...prevState,
               [targetStream.id]: true,
            }))
            try {
               if (!talentPoolDictionary[targetStream.id]) {
                  const users =
                     await livestreamRepo.getLivestreamTalentPoolMembers(
                        targetStream.companyId
                     )
                  const csvData = StatsUtil.getCsvData(
                     group,
                     targetStream,
                     users,
                     groupQuestions
                  )
                  setTalentPoolDictionary({
                     ...talentPoolDictionary,
                     [targetStream.id]: csvData,
                  })
               }
            } catch (e) {}
            setLoadingTalentPool((prevState) => ({
               ...prevState,
               [targetStream.id]: false,
            }))
         })()
      }
   }, [targetStream, registeredStudentsFromGroupDictionary, groupQuestions])
   const getLegacyRegisteredStudentsCsvData = useCallback(
      (targetRegisteredStudents: RegisteredStudent[]) => {
         let newRegisteredStudentsFromGroup
         if (group.universityCode) {
            newRegisteredStudentsFromGroup = targetRegisteredStudents
               .filter((student) => studentBelongsToGroup(student))
               .map((filteredStudent) =>
                  StatsUtil.getStudentInGroupDataObject(filteredStudent, group)
               )
         } else {
            const livestreamGroups = allGroups.filter((group) =>
               targetStream.groupIds.includes(group.id)
            )
            newRegisteredStudentsFromGroup = targetRegisteredStudents.map(
               (student) => {
                  const livestreamGroupUserBelongsTo =
                     StatsUtil.getFirstGroupThatUserBelongsTo(
                        student,
                        livestreamGroups,
                        group
                     )
                  return StatsUtil.getStudentInGroupDataObject(
                     student,
                     livestreamGroupUserBelongsTo || {}
                  )
               }
            )
         }
         return newRegisteredStudentsFromGroup
      },
      [allGroups, group, targetStream]
   )
   const getLegacyTalentPoolStudentsCsvData = useCallback(
      (targetUsers: UserData[]) => {
         return targetUsers.map((element) => {
            if (
               registeredStudentsFromGroupDictionary[targetStream.id]?.some(
                  (student) => student.Email === element.id
               )
            ) {
               let publishedStudent
               if (group.universityCode) {
                  publishedStudent = StatsUtil.getStudentInGroupDataObject(
                     element,
                     group
                  )
               } else {
                  const livestreamGroups = allGroups.filter((group) =>
                     targetStream.groupIds.includes(group.id)
                  )
                  const livestreamGroupUserBelongsTo =
                     StatsUtil.getFirstGroupThatUserBelongsTo(
                        element,
                        livestreamGroups,
                        group
                     )
                  publishedStudent = StatsUtil.getStudentInGroupDataObject(
                     element,
                     livestreamGroupUserBelongsTo || {}
                  )
               }
               return publishedStudent
            } else {
               return StatsUtil.getStudentOutsideGroupDataObject(
                  element,
                  allGroups
               )
            }
         })
      },
      [allGroups, group, targetStream]
   )

   const handleGetLivestreamReportData = useCallback(
      async (rowData: LivestreamEvent) => {
         try {
            if (!userData.userEmail)
               return dispatch(
                  actions.sendGeneralError("Unable to find user email")
               )

            if (reportDataDictionary[rowData.id]) {
               return setReportPdfData(reportDataDictionary[rowData.id])
            }
            setLoadingReportData((prevState) => ({
               ...prevState,
               [rowData.id]: true,
            }))
            const { data }: { data: PdfReportData } =
               await firebase.getLivestreamReportData({
                  targetStreamId: rowData.id,
                  userEmail: userData.userEmail,
                  targetGroupId: group.id,
               })
            setReportDataDictionary((prevState) => ({
               ...prevState,
               [rowData.id]: data,
            }))
            setReportPdfData(data)
         } catch (e) {
            dispatch(actions.sendGeneralError(e))
         }
         setLoadingReportData((prevState) => ({
            ...prevState,
            [rowData.id]: false,
         }))
      },
      [dispatch, group?.id, userData?.userEmail, reportDataDictionary]
   )

   function studentBelongsToGroup(student) {
      if (group.universityCode) {
         if (student.university?.code === group.universityCode) {
            return student.groupIds && student.groupIds.includes(group.groupId)
         } else {
            return false
         }
      } else {
         return student.groupIds && student.groupIds.includes(group.groupId)
      }
   }

   // Memorised talentPool action
   const talentPoolAction = useCallback(
      (rowData) => {
         const targetStreamTalentPoolData = talentPoolDictionary[rowData?.id]
         const actionLoading = loadingTalentPool[rowData?.id]

         const hintTitle = "Download Talent Pool"
         return {
            icon: targetStreamTalentPoolData ? (
               <GetAppIcon color="primary" />
            ) : actionLoading ? (
               <CircularProgress color="inherit" size={15} />
            ) : (
               <TalentPoolIcon color="action" />
            ),
            hintTitle,
            hintDescription:
               "Download a CSV with the details of the students who opted to put themselves in the talent pool",
            loadedButton: targetStreamTalentPoolData && (
               <CSVDialogDownload
                  title={hintTitle}
                  data={targetStreamTalentPoolData}
                  filename={
                     "TalentPool " + rowData.company + " " + rowData.id + ".csv"
                  }
               >
                  <ButtonWithHint
                     hintTitle={hintTitle}
                     style={{
                        marginTop: theme.spacing(0.5),
                     }}
                     hintDescription={
                        "Download a CSV with the details of the students who opted to put themselves in the talent pool"
                     }
                     startIcon={<TalentPoolIcon color="action" />}
                     className={undefined}
                     endIcon={undefined}
                  >
                     Download Talent Pool
                  </ButtonWithHint>
               </CSVDialogDownload>
            ),
            tooltip: targetStreamTalentPoolData
               ? "Download Talent Pool"
               : actionLoading
               ? "Getting Talent Pool..."
               : "Get Talent Pool",
            onClick: () => {},
            disabled: actionLoading,
            hidden: isDraft,
         }
      },
      [loadingTalentPool, targetStream, talentPoolDictionary, isDraft]
   )

   const pdfReportAction = useCallback(
      (rowData) => {
         const actionLoading = loadingReportData[rowData?.id]
         const reportData = reportDataDictionary[rowData?.id]

         return {
            icon: reportData ? (
               <PDFIcon />
            ) : actionLoading ? (
               <CircularProgress color="inherit" size={15} />
            ) : (
               <PDFIcon color="action" />
            ),
            hintTitle: "Download Report",
            hintDescription:
               "Generate a PDF report giving a concise breakdown of engagement metrics during the event.",
            tooltip: actionLoading
               ? "Downloading Report..."
               : "Download Report",
            onClick: reportData
               ? () => setReportPdfData(reportData)
               : () => handleGetLivestreamReportData(rowData),
            hidden: !isPast || isDraft,
            disabled: actionLoading,
         }
      },
      [isDraft, isPast, loadingReportData, reportDataDictionary, group]
   )

   const registeredStudentsAction = useCallback(
      (rowData) => {
         const actionLoading = loadingRegisteredUsersFromGroupData[rowData?.id]
         const registeredStudentsData =
            registeredStudentsFromGroupDictionary[rowData?.id]
         const canDownloadRegisteredStudents = Boolean(
            !isDraft &&
               (group.universityCode ||
                  group.privacyPolicyActive ||
                  userData?.isAdmin)
         )

         const hintTitle = "Download Registered Users"

         return {
            icon: actionLoading ? (
               <CircularProgress size={15} color="inherit" />
            ) : (
               <RegisteredUsersIcon color="action" />
            ),
            hintTitle,
            hintDescription:
               "Download a CSV with the details of the students who registered to your event",
            tooltip: registeredStudentsData
               ? "Download Registered Users"
               : actionLoading
               ? "Getting Registered Users..."
               : "Get Registered Users",
            onClick: () => {},
            hidden: !canDownloadRegisteredStudents,
            disabled: actionLoading || !canDownloadRegisteredStudents,
            loadedButton: registeredStudentsData && (
               <CSVDialogDownload
                  title={hintTitle}
                  data={registeredStudentsData}
                  filename={
                     "Registered Students " +
                     rowData.company +
                     " " +
                     rowData.id +
                     ".csv"
                  }
               >
                  <ButtonWithHint
                     startIcon={<RegisteredUsersIcon color="action" />}
                     hintTitle={hintTitle}
                     style={{
                        marginTop: theme.spacing(0.5),
                     }}
                     hintDescription={
                        "Download a CSV with the details of the students who registered to your event"
                     }
                  >
                     Download Registered Students
                  </ButtonWithHint>
               </CSVDialogDownload>
            ),
         }
      },
      [
         isDraft,
         isPast,
         registeredStudentsFromGroupDictionary,
         group,
         loadingRegisteredUsersFromGroupData,
         userData?.isAdmin,
      ]
   )

   return {
      talentPoolAction,
      pdfReportAction,
      reportPdfData,
      removeReportPdfData,
      registeredStudentsAction,
      setTargetStream,
      registeredStudentsFromGroupDictionary,
   }
}

interface CSVDialogDownloadProps {
   title: string
   data: any
   filename: string
   defaultOpen?: boolean
   onClose?: () => void
}

export const CSVDialogDownload: FC<CSVDialogDownloadProps> = ({
   title,
   children,
   data,
   filename,
   defaultOpen = false,
   onClose = null,
}) => {
   const [open, setOpen] = useState(defaultOpen)

   useEffect(() => {
      setOpen(defaultOpen)
   }, [defaultOpen])

   const handleOpen = useCallback((e) => {
      e.stopPropagation()
      setOpen(true)
   }, [])

   const handleClose = useCallback(
      (e) => {
         e.stopPropagation()
         setOpen(false)
         if (onClose) onClose()
      },
      [onClose]
   )

   const stopClickPropagation = useCallback((e) => {
      e.stopPropagation()
   }, [])

   // try to use right separator at the first try
   const mainSeparator = getCSVDelimiterBasedOnOS()
   const alternativeSeparator = mainSeparator === "," ? ";" : ","

   return (
      <>
         {!!children &&
            // @ts-ignore
            React.cloneElement(children, { onClick: handleOpen })}
         {open && (
            <Dialog open={open} onBackdropClick={handleClose}>
               <DialogTitle onClickCapture={stopClickPropagation}>
                  {title}
               </DialogTitle>
               <DialogContent onClickCapture={stopClickPropagation}>
                  <DialogContentText>
                     You will download a file in the .csv format. This file uses
                     a separator character that can vary with your regional
                     settings.
                  </DialogContentText>
                  <DialogContentText mt={2}>
                     Try the alternative version if having issues opening the
                     downloaded file.
                  </DialogContentText>
               </DialogContent>
               <DialogActions sx={{ justifyContent: "center" }}>
                  <CSVLink
                     data={data}
                     separator={mainSeparator}
                     filename={filename}
                     style={{ color: "red" }}
                     onClick={handleClose}
                  >
                     <Button variant="contained">Download</Button>
                  </CSVLink>

                  <CSVLink
                     data={data}
                     separator={alternativeSeparator}
                     filename={filename}
                     style={{ color: "red" }}
                     onClick={handleClose}
                  >
                     <Button autoFocus>Alternative</Button>
                  </CSVLink>
               </DialogActions>
            </Dialog>
         )}
      </>
   )
}
