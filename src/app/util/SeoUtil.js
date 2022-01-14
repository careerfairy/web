import { getResizedUrl } from "../components/helperFunctions/HelperFunctions";

export const getStreamMetaInfo = ({ stream, groupId }) => {
   return {
      title: `CareerFairy | Live Stream with ${stream.company}`,
      fullPath: groupId
         ? `https://careerfairy.io/upcoming-livestream/${stream.id}?groupId=${groupId}`
         : `https://careerfairy.io/upcoming-livestream/${stream.id}`,
      image: getResizedUrl(stream.backgroundImageUrl, "sm"),
      description: stream.title,
   };
};
