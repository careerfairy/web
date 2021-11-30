import { useFirebase, withFirebase } from "context/firebase";
import StatsUtil from "data/util/StatsUtil";
import { useState, useEffect, useCallback } from "react";
import PollUtil from "../../data/util/PollUtil";

export function useLivestreamMetadata({ livestream, group }) {
   const firebase = useFirebase();
   const [metaDataDictionary, setMetaDataDictionary] = useState({});
   // console.log("-> metaDataDictionary", metaDataDictionary);
   let average = (array) => array.reduce((a, b) => a + b) / array.length;

   // useEffect(() => {
   //    if (
   //       questions !== undefined &&
   //       polls !== undefined &&
   //       icons !== undefined &&
   //       livestreamSpeakers !== undefined &&
   //       overallRating !== undefined &&
   //       contentRating !== undefined &&
   //       talentPoolForReport !== undefined &&
   //       participatingStudentsFromGroup !== undefined &&
   //       studentStats !== undefined
   //    ) {
   //       setHasDownloadedReport(true);
   //    }
   // }, [
   //    questions,
   //    polls,
   //    icons,
   //    livestreamSpeakers,
   //    overallRating,
   //    contentRating,
   //    talentPoolForReport,
   //    participatingStudents,
   //    studentStats,
   // ]);

   useEffect(() => {
      if (livestream) {
         const unsubscribe = firebase.listenToLivestreamQuestions(
            livestream.id,
            (querySnapshot) => {
               const newQuestionList = querySnapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
               }));
               updateMetaDictionary("questions", newQuestionList);
            }
         );

         return () => unsubscribe();
      }
   }, [livestream]);

   useEffect(() => {
      if (livestream) {
         const unsubscribe = firebase.listenToPollEntries(
            livestream.id,
            (querySnapshot) => {
               const newPollList = querySnapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                  options: PollUtil.convertPollOptionsObjectToArray(
                     doc.data().options
                  ),
               }));
               updateMetaDictionary("polls", newPollList);
            }
         );
         return () => unsubscribe();
      }
   }, [livestream]);

   useEffect(() => {
      if (livestream) {
         (async function () {
            const querySnapshot = await firebase.getLivestreamSpeakers(
               livestream.id
            );
            const newSpeakerList = querySnapshot.docs.map((doc) => ({
               id: doc.id,
               ...doc.data(),
            }));
            updateMetaDictionary("livestreamSpeakers", newSpeakerList);
         })();
      }
   }, [livestream]);

   useEffect(() => {
      if (livestream) {
         const unsubscribe = firebase.listenToTotalLivestreamIcons(
            livestream.id,
            (querySnapshot) => {
               const newIconList = querySnapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
               }));
               updateMetaDictionary("icons", newIconList);
            }
         );
         return () => unsubscribe();
      }
   }, [livestream]);

   useEffect(() => {
      if (livestream && group) {
         (async function () {
            const querySnapshot = await firebase.getLivestreamParticipatingStudents(
               livestream.id
            );
            const newParticipatingStudents = querySnapshot.docs.map((doc) => ({
               id: doc.id,
               ...doc.data(),
            }));
            updateMetaDictionary(
               "participatingStudents",
               newParticipatingStudents
            );
         })();
      }
   }, [livestream, group]);

   useEffect(() => {
      const targetParticipatingStudents =
         metaDataDictionary[livestream?.id]?.participatingStudents;
      if (targetParticipatingStudents?.length) {
         let newStudentsOfGroup = [];
         targetParticipatingStudents.forEach((student) => {
            if (studentBelongsToGroup(student)) {
               let publishedStudent = StatsUtil.getStudentInGroupDataObject(
                  student,
                  group
               );
               newStudentsOfGroup.push(publishedStudent);
            }
         });
         updateMetaDictionary(
            "participatingStudentsFromGroup",
            newStudentsOfGroup
         );
      }
   }, [metaDataDictionary[livestream?.id]?.participatingStudents, livestream]);

   useEffect(() => {
      const targetParticipatingStudents =
         metaDataDictionary[livestream?.id]?.participatingStudents;
      if (targetParticipatingStudents?.length) {
         let listOfStudents = targetParticipatingStudents.filter((student) =>
            studentBelongsToGroup(student)
         );
         let stats = StatsUtil.getRegisteredStudentsStats(
            listOfStudents,
            group
         );
         updateMetaDictionary("studentStats", stats);
      }
   }, [metaDataDictionary[livestream?.id]?.participatingStudents, livestream]);

   useEffect(() => {
      if (livestream) {
         const unsubscribe = firebase.listenToLivestreamOverallRatings(
            livestream.id,
            (querySnapshot) => {
               let overallRatings = [];
               querySnapshot.forEach((doc) => {
                  let cc = doc.data();
                  cc.id = doc.id;
                  if (cc.rating > 0) {
                     overallRatings.push(cc.rating);
                  }
               });
               let value =
                  overallRatings.length > 0
                     ? average(overallRatings).toFixed(2)
                     : "N.A.";
               updateMetaDictionary("overallRating", value);
            }
         );
         return () => unsubscribe();
      }
   }, [livestream]);

   useEffect(() => {
      if (livestream) {
         const unsubscribe = firebase.listenToLivestreamContentRatings(
            livestream.id,
            (querySnapshot) => {
               const contentRatings = querySnapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
               }));
               let value =
                  contentRatings.length > 0
                     ? average(contentRatings).toFixed(2)
                     : "N.A.";
               updateMetaDictionary("contentRating", value);
            }
         );
         return () => unsubscribe();
      }
   }, [livestream]);

   useEffect(() => {
      if (livestream) {
         (async function () {
            const querySnapshot = await firebase.getLivestreamTalentPoolMembers(
               livestream.companyId
            );
            const registeredStudents = querySnapshot.docs.map((doc) => ({
               id: doc.id,
               ...doc.data(),
            }));
            updateMetaDictionary("talentPoolForReport", registeredStudents);
         })();
      }
   }, [livestream]);

   const updateMetaDictionary = useCallback(
      (prop, newPropData) => {
         setMetaDataDictionary((prevState) => ({
            ...prevState,
            [livestream.id]: {
               ...(prevState[livestream?.id] && prevState[livestream.id]),
               [prop]: newPropData,
            },
         }));
      },
      [livestream]
   );

   function studentBelongsToGroup(student) {
      if (group.universityCode) {
         // if (student.university?.code === group.universityCode) {
         return student.university?.code === group.universityCode;
         // return student.groupIds && student.groupIds.includes(group.groupId);
         // } else {
         //     return false;
         // }
      } else {
         return student.groupIds && student.groupIds.includes(group.groupId);
      }
   }

   return metaDataDictionary;
}
