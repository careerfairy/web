import { withFirebase } from "context/firebase";
import StatsUtil from "data/util/StatsUtil";
import { useState, useEffect } from "react";
import PollUtil from "../../data/util/PollUtil";

export function useLivestreamMetadata(
   livestream,
   group,
   firebase,
   userRequestedDownload
) {
   const [questions, setQuestions] = useState(undefined);
   const [polls, setPolls] = useState(undefined);
   const [icons, setIcons] = useState(undefined);
   const [livestreamSpeakers, setLivestreamSpeakers] = useState(undefined);
   const [overallRating, setOverallRating] = useState(undefined);
   const [contentRating, setContentRating] = useState(undefined);
   const [talentPoolForReport, setTalentPoolForReport] = useState(undefined);
   const [participatingStudents, setParticipatingStudents] = useState(
      undefined
   );
   const [
      participatingStudentsFromGroup,
      setParticipatingStudentsFromGroup,
   ] = useState(undefined);
   const [studentStats, setStudentStats] = useState(undefined);

   const [hasDownloadedReport, setHasDownloadedReport] = useState(false);

   let average = (array) => array.reduce((a, b) => a + b) / array.length;

   useEffect(() => {
      if (
         questions !== undefined &&
         polls !== undefined &&
         icons !== undefined &&
         livestreamSpeakers !== undefined &&
         overallRating !== undefined &&
         contentRating !== undefined &&
         talentPoolForReport !== undefined &&
         participatingStudentsFromGroup !== undefined &&
         studentStats !== undefined
      ) {
         setHasDownloadedReport(true);
      }
   }, [
      questions,
      polls,
      icons,
      livestreamSpeakers,
      overallRating,
      contentRating,
      talentPoolForReport,
      participatingStudents,
      studentStats,
   ]);

   useEffect(() => {
      if (livestream && userRequestedDownload) {
         const unsubscribe = firebase.listenToLivestreamQuestions(
            livestream.id,
            (querySnapshot) => {
               let questionList = [];
               querySnapshot.forEach((doc) => {
                  let cc = doc.data();
                  cc.id = doc.id;
                  questionList.push(cc);
               });
               setQuestions(questionList);
            }
         );

         return () => unsubscribe();
      }
   }, [livestream, userRequestedDownload]);

   useEffect(() => {
      if (livestream && userRequestedDownload) {
         const unsubscribe = firebase.listenToPollEntries(
            livestream.id,
            (querySnapshot) => {
               let pollList = [];
               querySnapshot.forEach((doc) => {
                  let cc = doc.data();
                  cc.id = doc.id;
                  cc.options = PollUtil.convertPollOptionsObjectToArray(
                     cc.options
                  );
                  pollList.push(cc);
               });
               setPolls(pollList);
            }
         );
         return () => unsubscribe();
      }
   }, [livestream, userRequestedDownload]);

   useEffect(() => {
      if (livestream && userRequestedDownload) {
         firebase.getLivestreamSpeakers(livestream.id).then((querySnapshot) => {
            var speakerList = [];
            querySnapshot.forEach((doc) => {
               let speaker = doc.data();
               speaker.id = doc.id;
               speakerList.push(speaker);
            });
            setLivestreamSpeakers(speakerList);
         });
      }
   }, [livestream, userRequestedDownload]);

   useEffect(() => {
      if (livestream && userRequestedDownload) {
         const unsubscribe = firebase.listenToTotalLivestreamIcons(
            livestream.id,
            (querySnapshot) => {
               let iconList = [];
               querySnapshot.forEach((doc) => {
                  let cc = doc.data();
                  cc.id = doc.id;
                  iconList.push(cc);
               });
               setIcons(iconList);
            }
         );
         return () => unsubscribe();
      }
   }, [livestream, userRequestedDownload]);

   useEffect(() => {
      if (livestream && group && userRequestedDownload) {
         firebase
            .getLivestreamParticipatingStudents(livestream.id)
            .then((querySnapshot) => {
               let participatingStudents = [];
               querySnapshot.forEach((doc) => {
                  let student = doc.data();
                  student.id = doc.id;
                  participatingStudents.push(student);
               });
               setParticipatingStudents(participatingStudents);
            });
      }
   }, [livestream, group, userRequestedDownload]);

   useEffect(() => {
      if (
         participatingStudents &&
         participatingStudents.length &&
         userRequestedDownload
      ) {
         let studentsOfGroup = [];
         participatingStudents.forEach((student) => {
            if (studentBelongsToGroup(student)) {
               let publishedStudent = StatsUtil.getStudentInGroupDataObject(
                  student,
                  group
               );
               studentsOfGroup.push(publishedStudent);
            }
         });
         setParticipatingStudentsFromGroup(studentsOfGroup);
      }
   }, [participatingStudents, userRequestedDownload]);

   useEffect(() => {
      if (
         participatingStudents &&
         participatingStudents.length &&
         userRequestedDownload
      ) {
         let listOfStudents = participatingStudents.filter((student) =>
            studentBelongsToGroup(student)
         );
         let stats = StatsUtil.getRegisteredStudentsStats(
            listOfStudents,
            group
         );
         setStudentStats(stats);
      }
   }, [participatingStudents, userRequestedDownload]);

   useEffect(() => {
      if (livestream && userRequestedDownload) {
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
               setOverallRating(value);
            }
         );
         return () => unsubscribe();
      }
   }, [livestream, userRequestedDownload]);

   useEffect(() => {
      if (livestream && userRequestedDownload) {
         const unsubscribe = firebase.listenToLivestreamContentRatings(
            livestream.id,
            (querySnapshot) => {
               let contentRatings = [];
               querySnapshot.forEach((doc) => {
                  let cc = doc.data();
                  cc.id = doc.id;
                  contentRatings.push(cc.rating);
               });
               let value =
                  contentRatings.length > 0
                     ? average(contentRatings).toFixed(2)
                     : "N.A.";
               setContentRating(value);
            }
         );
         return () => unsubscribe();
      }
   }, [livestream, userRequestedDownload]);

   useEffect(() => {
      if (livestream && userRequestedDownload) {
         firebase
            .getLivestreamTalentPoolMembers(livestream.companyId)
            .then((querySnapshot) => {
               let registeredStudents = [];
               querySnapshot.forEach((doc) => {
                  let element = doc.data();
                  registeredStudents.push(element);
               });
               setTalentPoolForReport(registeredStudents);
            });
      }
   }, [livestream, userRequestedDownload]);

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

   return {
      hasDownloadedReport,
      questions,
      polls,
      icons,
      livestreamSpeakers,
      overallRating,
      contentRating,
      talentPoolForReport,
      participatingStudents,
      participatingStudentsFromGroup,
      studentStats,
   };
}
