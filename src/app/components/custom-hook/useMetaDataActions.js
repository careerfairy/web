import StatsUtil from "data/util/StatsUtil";
import React, { useCallback, useEffect, useRef, useState } from "react";
import TalentPoolIcon from "@material-ui/icons/HowToRegRounded";
import { useFirebase } from "../../context/firebase";
import { CircularProgress } from "@material-ui/core";
import { CSVLink } from "react-csv";
import GetAppIcon from "@material-ui/icons/GetApp";
import PDFIcon from "@material-ui/icons/PictureAsPdf";
import { useAuth } from "../../HOCs/AuthProvider";
import RegisteredUsersIcon from "@material-ui/icons/People";
import * as actions from "store/actions";
import { useDispatch } from "react-redux";
import ButtonWithHint from "../views/group/admin/events/events-table/ButtonWithHint";
import { useTheme } from "@material-ui/core/styles";

export function useMetaDataActions({ allGroups, group, isPast, isDraft }) {
   const firebase = useFirebase();
   const { userData } = useAuth();
   const theme = useTheme();
   const dispatch = useDispatch();
   const [talentPoolDictionary, setTalentPoolDictionary] = useState({});
   const [targetStream, setTargetStream] = useState(null);
   const [loadingReportData, setLoadingReportData] = useState({});
   const [
      loadingRegisteredUsersFromGroupData,
      setLoadingRegisteredUsersFromGroupData,
   ] = useState({});
   const [loadingTalentPool, setLoadingTalentPool] = useState({});

   const [
      registeredStudentsFromGroupDictionary,
      setRegisteredStudentsFromGroupDictionary,
   ] = useState({});
   const [reportDataDictionary, setReportDataDictionary] = useState({});
   const [reportPdfData, setReportPdfData] = useState(null);

   const [
      registeredStudentsDictionary,
      setRegisteredStudentsDictionary,
   ] = useState({});

   const removeReportPdfData = useCallback(() => {
      setReportPdfData(null);
   }, []);

   useEffect(() => {
      (function handleGetRegisteredUsersFromGroup() {
         try {
            if (!targetStream?.id) return;
            const targetRegisteredStudents =
               registeredStudentsDictionary[targetStream?.id];
            setLoadingRegisteredUsersFromGroupData((prevState) => ({
               ...prevState,
               [targetStream.id]: true,
            }));
            if (targetRegisteredStudents && targetRegisteredStudents.length) {
               let newRegisteredStudentsFromGroup;
               if (group.universityCode) {
                  newRegisteredStudentsFromGroup = targetRegisteredStudents
                     .filter((student) => studentBelongsToGroup(student))
                     .map((filteredStudent) =>
                        StatsUtil.getStudentInGroupDataObject(
                           filteredStudent,
                           group
                        )
                     );
               } else {
                  const livestreamGroups = allGroups.filter((group) =>
                     targetStream.groupIds.includes(group.id)
                  );
                  newRegisteredStudentsFromGroup = targetRegisteredStudents.map(
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

               setRegisteredStudentsFromGroupDictionary({
                  ...registeredStudentsFromGroupDictionary,
                  [targetStream.id]: newRegisteredStudentsFromGroup,
               });
            }
         } catch (e) {
            dispatch(actions.sendGeneralError(e));
         }
         setLoadingRegisteredUsersFromGroupData((prevState) => ({
            ...prevState,
            [targetStream.id]: false,
         }));
      })();
   }, [registeredStudentsDictionary, targetStream, group]);

   useEffect(() => {
      if (targetStream && group) {
         (async function () {
            const querySnapshot = await firebase.getLivestreamRegisteredStudents(
               targetStream.id
            );
            const newRegisteredStudents = querySnapshot.docs.map((doc) => ({
               id: doc.id,
               ...doc.data(),
            }));

            setRegisteredStudentsDictionary({
               ...registeredStudentsDictionary,
               [targetStream.id]: newRegisteredStudents,
            });
         })();
      }
   }, [targetStream, group]);

   useEffect(() => {
      if (targetStream) {
         (async function () {
            setLoadingTalentPool((prevState) => ({
               ...prevState,
               [targetStream.id]: true,
            }));
            try {
               if (!talentPoolDictionary[targetStream.id]) {
                  const querySnapshot = await firebase.getLivestreamTalentPoolMembers(
                     targetStream.companyId
                  );
                  const registeredStudents = querySnapshot.docs.map((doc) => {
                     let element = doc.data();
                     if (
                        registeredStudentsFromGroupDictionary[
                           targetStream.id
                        ]?.some((student) => student.Email === doc.id)
                     ) {
                        let publishedStudent;
                        if (group.universityCode) {
                           publishedStudent = StatsUtil.getStudentInGroupDataObject(
                              element,
                              group
                           );
                        } else {
                           const livestreamGroups = allGroups.filter((group) =>
                              targetStream.groupIds.includes(group.id)
                           );
                           const livestreamGroupUserBelongsTo = StatsUtil.getFirstGroupThatUserBelongsTo(
                              element,
                              livestreamGroups,
                              group
                           );
                           publishedStudent = StatsUtil.getStudentInGroupDataObject(
                              element,
                              livestreamGroupUserBelongsTo || {}
                           );
                        }
                        return publishedStudent;
                     } else {
                        return StatsUtil.getStudentOutsideGroupDataObject(
                           element,
                           allGroups
                        );
                     }
                  });

                  setTalentPoolDictionary({
                     ...talentPoolDictionary,
                     [targetStream.id]: registeredStudents,
                  });
               }
            } catch (e) {}
            setLoadingTalentPool((prevState) => ({
               ...prevState,
               [targetStream.id]: false,
            }));
         })();
      }
   }, [targetStream, registeredStudentsFromGroupDictionary]);

   const handleGetLivestreamReportData = useCallback(
      async (rowData) => {
         try {
            if (!userData.userEmail)
               return dispatch(
                  actions.sendGeneralError("Unable to find user email")
               );

            if (reportDataDictionary[rowData.id]) {
               return setReportPdfData(reportDataDictionary[rowData.id]);
            }
            setLoadingReportData((prevState) => ({
               ...prevState,
               [rowData.id]: true,
            }));
            const { data } = await firebase.getLivestreamReportData({
               targetStreamId: rowData.id,
               userEmail: userData.userEmail,
               targetGroupId: group.id,
            });
            setReportDataDictionary((prevState) => ({
               ...prevState,
               [rowData.id]: data,
            }));
            setReportPdfData(data);
         } catch (e) {
            dispatch(actions.sendGeneralError(e));
         }
         setLoadingReportData((prevState) => ({
            ...prevState,
            [rowData.id]: false,
         }));
      },
      [dispatch, group?.id, userData?.userEmail, reportDataDictionary]
   );

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

   // Memorised talentPool action
   const talentPoolAction = useCallback(
      (rowData) => {
         const targetStreamTalentPoolData = talentPoolDictionary[rowData?.id];
         const actionLoading = loadingTalentPool[rowData?.id];
         return {
            icon: targetStreamTalentPoolData ? (
               <GetAppIcon color="primary" />
            ) : actionLoading ? (
               <CircularProgress color="inherit" size={15} />
            ) : (
               <TalentPoolIcon color="action" />
            ),
            hintTitle: "Download Talent Pool",
            hintDescription:
               "Download a CSV with the details of the students who opted to put themselves in the talent pool",
            loadedButton: targetStreamTalentPoolData && (
               <CSVLink
                  data={targetStreamTalentPoolData}
                  separator={";"}
                  filename={
                     "TalentPool " + rowData.company + " " + rowData.id + ".csv"
                  }
                  style={{ color: "red" }}
               >
                  <ButtonWithHint
                     hintTitle={"Download Talent Pool"}
                     style={{
                        marginTop: theme.spacing(0.5),
                     }}
                     hintDescription={
                        "Download a CSV with the details of the students who opted to put themselves in the talent pool"
                     }
                     startIcon={<TalentPoolIcon color="action" />}
                  >
                     Download Talent Pool
                  </ButtonWithHint>
               </CSVLink>
            ),
            tooltip: targetStreamTalentPoolData
               ? "Download Talent Pool"
               : actionLoading
               ? "Getting Talent Pool..."
               : "Get Talent Pool",
            onClick: () => {},
            disabled: actionLoading,
            hidden: isDraft,
         };
      },
      [loadingTalentPool, targetStream, talentPoolDictionary, isDraft]
   );

   const pdfReportAction = useCallback(
      (rowData) => {
         const actionLoading = loadingReportData[rowData?.id];
         const reportData = reportDataDictionary[rowData?.id];

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
         };
      },
      [isDraft, isPast, loadingReportData, reportDataDictionary, group]
   );

   const registeredStudentsAction = useCallback(
      (rowData) => {
         const actionLoading = loadingRegisteredUsersFromGroupData[rowData?.id];
         const registeredStudentsData =
            registeredStudentsFromGroupDictionary[rowData?.id];
         const canDownloadRegisteredStudents = Boolean(
            !isDraft &&
               (group.universityCode ||
                  group.privacyPolicyActive ||
                  userData?.isAdmin)
         );
         return {
            icon: actionLoading ? (
               <CircularProgress size={15} color="inherit" />
            ) : (
               <RegisteredUsersIcon color="action" />
            ),
            hintTitle: "Download Registered Users",
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
               <CSVLink
                  data={registeredStudentsData}
                  separator={";"}
                  filename={
                     "Registered Students " +
                     rowData.company +
                     " " +
                     rowData.id +
                     ".csv"
                  }
                  style={{ color: "red" }}
               >
                  <ButtonWithHint
                     startIcon={<RegisteredUsersIcon color="action" />}
                     hintTitle={"Download Registered Users"}
                     style={{
                        marginTop: theme.spacing(0.5),
                     }}
                     hintDescription={
                        "Download a CSV with the details of the students who registered to your event"
                     }
                  >
                     Download Registered Students
                  </ButtonWithHint>
               </CSVLink>
            ),
         };
      },
      [
         isDraft,
         isPast,
         registeredStudentsFromGroupDictionary,
         group,
         loadingRegisteredUsersFromGroupData,
         userData?.isAdmin,
      ]
   );

   return {
      talentPoolAction,
      pdfReportAction,
      reportPdfData,
      removeReportPdfData,
      registeredStudentsAction,
      setTargetStream,
   };
}
