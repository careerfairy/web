const { DateTime } = require("luxon");

const setHeaders = (req, res) => {
   res.set("Access-Control-Allow-Origin", "*");
   res.set("Access-Control-Allow-Credentials", "true");

   if (req.method === "OPTIONS") {
      // Send response to OPTIONS requests
      res.set("Access-Control-Allow-Methods", "GET");
      res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.set("Access-Control-Max-Age", "3600");
      return res.status(204).send("");
   }
};

const getStreamLink = (streamId) => {
   return "https://www.careerfairy.io/upcoming-livestream/" + streamId;
};

const formatHour = (LuxonTime) => {
   return `${LuxonTime.hour}:${
      LuxonTime.minute < 10 ? "0" + LuxonTime.minute : LuxonTime.minute
   } ${LuxonTime.offsetNameShort}`;
};

const getLivestreamTimeInterval = (
   livestreamStartDateTime,
   livestreamTimeZone
) => {
   var startDateTime = DateTime.fromJSDate(livestreamStartDateTime.toDate(), {
      zone: livestreamTimeZone,
   }).toFormat("HH:mm ZZZZ", { locale: "en-GB" });
   return `(${startDateTime})`;
};

const generateEmailData = (livestreamId, livestream, startingNow) => {
   let recipientEmails = livestream.registeredUsers.join();
   var luxonStartDateTime = DateTime.fromJSDate(livestream.start.toDate(), {
      zone: livestream.timezone || "Europe/Zurich",
   });
   const mailgunVariables = {
      company: livestream.company,
      startTime: luxonStartDateTime.toFormat("HH:mm ZZZZ", { locale: "en-GB" }),
      streamLink: livestream.externalEventLink
         ? livestream.externalEventLink
         : getStreamLink(livestreamId),
      german: livestream.language === "DE" ? true : false,
   };
   let recipientVariablesObj = {};
   livestream.registeredUsers.forEach((email) => {
      recipientVariablesObj[email] = mailgunVariables;
   });
   if (startingNow) {
      return {
         from: "CareerFairy <noreply@careerfairy.io>",
         to: recipientEmails,
         subject:
            "NOW: Live Stream with " +
            livestream.company +
            " " +
            getLivestreamTimeInterval(
               livestream.start,
               livestream.timezone || "Europe/Zurich"
            ),
         template: "registration-reminder",
         "recipient-variables": JSON.stringify(recipientVariablesObj),
      };
   } else {
      return {
         from: "CareerFairy <noreply@careerfairy.io>",
         to: recipientEmails,
         subject:
            "Reminder: Live Stream with " +
            livestream.company +
            " " +
            getLivestreamTimeInterval(
               livestream.start,
               livestream.timezone || "Europe/Zurich"
            ),
         template: "registration-reminder",
         "recipient-variables": JSON.stringify(recipientVariablesObj),
         "o:deliverytime": luxonStartDateTime
            .minus({ minutes: 45 })
            .toRFC2822(),
      };
   }
};

const getArrayDifference = (array1, array2) => {
   return array2.filter((element) => {
      return !array1.includes(element);
   });
};

const makeRequestingGroupIdFirst = (
   arrayOfGroupIds = [],
   requestingGroupId
) => {
   let newArray = [...arrayOfGroupIds];
   if (!requestingGroupId) return newArray;
   const RequestingGroupIsInArray = newArray.find(
      (groupId) => requestingGroupId === groupId
   );
   if (!RequestingGroupIsInArray) return newArray;
   newArray = newArray.filter((groupId) => groupId !== requestingGroupId);
   newArray.unshift(requestingGroupId);
   return newArray;
};

const studentBelongsToGroup = (student, group) => {
   // return (
   //    student && student.groupIds && student.groupIds.includes(group.groupId)
   // );
   if (group.universityCode) {
      return (
         student &&
         student.university &&
         student.university.code === group.universityCode
      );
   } else {
      return (
         student && student.groupIds && student.groupIds.includes(group.groupId)
      );
   }
};

const convertPollOptionsObjectToArray = (pollOptionsObject) => {
   return Object.keys(pollOptionsObject).map((key) => ({
      ...pollOptionsObject[key],
      index: key,
   }));
};

const getRegisteredGroupById = (student, groupId) => {
   return (
      student.registeredGroups &&
      student.registeredGroups.find((category) => category.groupId === groupId)
   );
};

const stringMatches = (string1, string2) => {
   return (
      string1.toLowerCase().replace(/\s/g, "") ===
      string2.toLowerCase().replace(/\s/g, "")
   );
};

const getStudentInGroupDataObject = (student, group) => {
   let studentDataObject = {
      "First Name": student.firstName,
      "Last Name": student.lastName,
      Email: student.userEmail,
      University: (student.university && student.university.name) || "N/A",
   };
   let studentCategoriesForGroup = getRegisteredGroupById(
      student,
      group.groupId
   );
   if (
      studentCategoriesForGroup &&
      studentCategoriesForGroup.categories &&
      studentCategoriesForGroup.categories.length &&
      group.categories
   ) {
      group.categories.forEach((category) => {
         let studentCatValue = studentCategoriesForGroup.categories.find(
            (studCat) => studCat.id === category.id
         );
         if (studentCatValue) {
            let studentSelectedOption = category.options.find(
               (option) => option.id === studentCatValue.selectedValueId
            );
            if (studentSelectedOption) {
               studentDataObject[category.name] = studentSelectedOption.name;
            }
         }
      });
   }
   return studentDataObject;
};

const groupHasSpecializedCategories = (group) => {
   if (group.categories) {
      let fieldOfStudyCategory = group.categories.find((category) =>
         stringMatches(category.name, "field of study")
      );
      let levelOfStudyCategory = group.categories.find((category) =>
         stringMatches(category.name, "level of study")
      );
      return fieldOfStudyCategory && levelOfStudyCategory;
   }
   return false;
};

const getSpecializedStudentStats = (registeredStudentsFromGroup, group) => {
   let fieldOfStudyCategory = group.categories.find((category) =>
      stringMatches(category.name, "field of study")
   );
   let levelOfStudyCategory = group.categories.find((category) =>
      stringMatches(category.name, "level of study")
   );
   let categoryStats = {
      type: "specialized",
      id: fieldOfStudyCategory.id,
      options: {},
      names: levelOfStudyCategory.options.map((option) => option.name),
   };
   fieldOfStudyCategory.options.forEach((option) => {
      let optionObj = {
         name: option.name,
         id: levelOfStudyCategory.id,
         entries: 0,
         subOptions: {},
      };
      levelOfStudyCategory.options.forEach((option2) => {
         let option2Obj = {
            name: option2.name,
            entries: 0,
         };
         optionObj.subOptions[option2.id] = option2Obj;
      });
      categoryStats.options[option.id] = optionObj;
   });
   registeredStudentsFromGroup.forEach((student) => {
      let registeredGroup = getRegisteredGroupById(student, group.groupId);
      let targetFieldOfStudyOption =
         registeredGroup &&
         registeredGroup.categories.find(
            (category) => category.id === fieldOfStudyCategory.id
         );
      let fieldOfStudyOptionId =
         targetFieldOfStudyOption && targetFieldOfStudyOption.selectedValueId;
      let targetLevelOfStudyOption =
         registeredGroup &&
         registeredGroup.categories.find(
            (category) => category.id === levelOfStudyCategory.id
         );
      let levelOfStudyOptionId =
         targetLevelOfStudyOption && targetLevelOfStudyOption.selectedValueId;
      if (
         categoryStats.options[fieldOfStudyOptionId] &&
         categoryStats.options[fieldOfStudyOptionId].subOptions[
            levelOfStudyOptionId
         ]
      ) {
         categoryStats.options[fieldOfStudyOptionId].entries =
            categoryStats.options[fieldOfStudyOptionId].entries + 1;
         categoryStats.options[fieldOfStudyOptionId].subOptions[
            levelOfStudyOptionId
         ].entries =
            categoryStats.options[fieldOfStudyOptionId].subOptions[
               levelOfStudyOptionId
            ].entries + 1;
      }
   });
   return categoryStats;
};

const getRegisteredStudentsStats = (registeredStudentsFromGroup, group) => {
   // console.log(
   //    `-> groupHasSpecializedCategories for ${group}`,
   //    groupHasSpecializedCategories(group)
   // );
   if (groupHasSpecializedCategories(group)) {
      return getSpecializedStudentStats(registeredStudentsFromGroup, group);
   }
   let categoryStats = {};
   if (group.categories && group.categories.length) {
      group.categories.forEach((category) => {
         category.options.forEach((option) => {
            if (!categoryStats[category.id]) {
               categoryStats[category.id] = {};
            }
            categoryStats[category.id][option.id] = 0;
         });
         categoryStats[category.id].name = category.name;
      });
      registeredStudentsFromGroup.forEach((student) => {
         let registeredGroup = getRegisteredGroupById(student, group.groupId);
         if (registeredGroup) {
            registeredGroup.categories.forEach((category) => {
               categoryStats[category.id][category.selectedValueId] =
                  categoryStats[category.id][category.selectedValueId] + 1;
            });
         }
      });
   }
   // console.log("-> group.categories", group.categories);
   // console.log("-> group.length", group.length);
   // console.log(`-> categoryStats for ${group}`, categoryStats);
   return categoryStats;
};

const getRatingsAverage = (contentRatings) =>
   contentRatings.reduce((a, b) => {
      return a + b.rating || 0;
   }, 0) / contentRatings.length;

const getDateString = (streamData) => {
   const dateString =
      streamData &&
      streamData.start &&
      streamData.start.toDate &&
      streamData.start.toDate().toString();
   return dateString || "";
};

module.exports = {
   setHeaders,
   generateEmailData,
   formatHour,
   getLivestreamTimeInterval,
   getStreamLink,
   getArrayDifference,
   makeRequestingGroupIdFirst,
   studentBelongsToGroup,
   convertPollOptionsObjectToArray,
   getStudentInGroupDataObject,
   getRegisteredStudentsStats,
   getRatingsAverage,
   getDateString,
};
