import StatsUtil from "data/util/StatsUtil";
import React, { useCallback, useEffect, useState } from "react";
import TalentPoolIcon from "@material-ui/icons/HowToRegRounded";
import { useFirebase } from "../../context/firebase";
import { Button, CircularProgress } from "@material-ui/core";
import { CSVLink } from "react-csv";
import GetAppIcon from "@material-ui/icons/GetApp";
import GenerateReportIcon from "@material-ui/icons/PictureAsPdf";
import { PDFDownloadLink } from "@react-pdf/renderer";
import LivestreamPdfReport from "../views/group/admin/events/enhanced-group-stream-card/LivestreamPdfReport";
import { useLivestreamMetadata } from "./useLivestreamMetadata";

export function useMetaDataActions({ allGroups, group, isPast }) {
   const firebase = useFirebase();
   const [talentPoolDictionary, setTalentPoolDictionary] = useState({});
   const [targetStream, setTargetStream] = useState(null);

   const {} = useLivestreamMetadata({ livestream: targetStream, group });

   const [loadingTalentPool, setLoadingTalentPool] = useState({});
   const [loadingReport, setLoadingReport] = useState({});
   const [
      registeredStudentsFromGroupDictionary,
      setRegisteredStudentsFromGroupDictionary,
   ] = useState({});

   const [
      registeredStudentsDictionary,
      setRegisteredStudentsDictionary,
   ] = useState({});

   useEffect(() => {
      const targetRegisteredStudents =
         registeredStudentsDictionary[targetStream?.id];
      if (targetRegisteredStudents && targetRegisteredStudents.length) {
         let newRegisteredStudentsFromGroup;
         if (group.universityCode) {
            newRegisteredStudentsFromGroup = targetRegisteredStudents
               .filter((student) => studentBelongsToGroup(student))
               .map((filteredStudent) =>
                  StatsUtil.getStudentInGroupDataObject(filteredStudent, group)
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
            setLoadingTalentPool({ [targetStream.id]: true });
            try {
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
            } catch (e) {}
            setLoadingTalentPool({ [targetStream.id]: false });
         })();
      }
   }, [targetStream, targetStream, registeredStudentsFromGroupDictionary]);

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
            icon: () => {
               return targetStreamTalentPoolData ? (
                  <CSVLink
                     data={targetStreamTalentPoolData}
                     separator={";"}
                     filename={
                        "TalentPool " +
                        rowData.company +
                        " " +
                        rowData.id +
                        ".csv"
                     }
                     style={{ color: "red" }}
                  >
                     <GetAppIcon color="primary" />
                  </CSVLink>
               ) : actionLoading ? (
                  <CircularProgress size={15} />
               ) : (
                  <TalentPoolIcon color="action" />
               );
            },
            tooltip: targetStreamTalentPoolData
               ? "Download Talent Pool"
               : actionLoading
               ? "Generating Talent Pool..."
               : "Generate Talent Pool",
            onClick: () => setTargetStream(rowData),
            disabled: actionLoading,
         };
      },
      [loadingTalentPool, targetStream, talentPoolDictionary]
   );

   const pdfReportAction = useCallback(
      (rowData) => {
         const targetReportData = talentPoolDictionary[rowData?.id];
         const reportLoading = loadingReport[rowData?.id];

         return {
            icon: () => {
               return targetReportData ? (
                  <PDFDownloadLink
                     fileName={`General Report ${rowData.company} ${rowData.id}.pdf`}
                     document={
                        <LivestreamPdfReport
                           group={group}
                           livestream={rowData}
                           studentStats={studentStats}
                           speakers={rowData.speakers}
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
                        <GetAppIcon color="primary" />
                     )}
                  </PDFDownloadLink>
               ) : reportLoading ? (
                  <CircularProgress size={15} />
               ) : (
                  <GenerateReportIcon color="action" />
               );
            },
            hidden: !isPast,
            onClick: () => setTargetStream(rowData),
            tooltip: targetReportData
               ? "Download Report"
               : reportLoading
               ? "Generating Report..."
               : "Generate Report",
            disabled: reportLoading,
         };
      },
      [targetStream, isPast, loadingReport]
   );

   return { talentPoolAction, pdfReportAction };
}
