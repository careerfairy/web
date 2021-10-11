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

module.exports = {
   setHeaders,
   generateEmailData,
   formatHour,
   getLivestreamTimeInterval,
   getStreamLink,
   getArrayDifference,
};
