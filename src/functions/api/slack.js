const { axios } = require("./axios");

const notifyLivestreamStarting = (webhookUrl, livestreamObj) => {
   const link = `https://www.careerfairy.io/upcoming-livestream/${livestreamObj.id}`;

   const body = {
      Company: livestreamObj.company,
      Speakers: livestreamObj.speakers?.length,
      Duration: `${livestreamObj.duration} minutes`,
      "Registered Users": livestreamObj.registeredUsers?.length ?? 0,
      "Talent Pool": livestreamObj.talentPool?.length ?? 0,
   };

   return axios({
      method: "post",
      data: {
         blocks: [
            {
               type: "section",
               text: {
                  type: "mrkdwn",
                  text: `New Livestream starting now :fire:\n*<${link}|${livestreamObj.title}>*`,
               },
            },
            {
               type: "section",
               text: {
                  type: "mrkdwn",
                  text: generateBodyStr(body),
               },
               accessory: {
                  type: "image",
                  image_url: livestreamObj.companyLogoUrl,
                  alt_text: livestreamObj.company,
               },
            },
         ],
      },
      url: webhookUrl,
      headers: {
         "Content-Type": "application/json",
      },
   });
};

function generateBodyStr(fieldsObj) {
   let result = "";

   for (let key in fieldsObj) {
      result += `*${key}:* ${fieldsObj[key]}\n`;
   }

   return result;
}

module.exports = {
   notifyLivestreamStarting,
};
