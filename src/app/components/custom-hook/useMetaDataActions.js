import StatsUtil from "data/util/StatsUtil";
import React, { useCallback, useEffect, useState } from "react";
import TalentPoolIcon from "@material-ui/icons/HowToRegRounded";
import { useFirebase } from "../../context/firebase";
import { CircularProgress } from "@material-ui/core";
import { CSVLink } from "react-csv";
import GetAppIcon from "@material-ui/icons/GetApp";
import PDFIcon from "@material-ui/icons/PictureAsPdf";

export function useMetaDataActions({ allGroups, group, isPast, isDraft }) {
   const firebase = useFirebase();
   const [talentPoolDictionary, setTalentPoolDictionary] = useState({});
   const [targetStream, setTargetStream] = useState(null);

   const [loadingTalentPool, setLoadingTalentPool] = useState({});
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
      (rowData) => ({
         icon: () => <PDFIcon />,
         tooltip: "Download Report",
         onClick: () => {},
         hidden: !isPast || isDraft,
      }),
      [isDraft, isPast]
   );

   return { talentPoolAction, pdfReportAction };
}
