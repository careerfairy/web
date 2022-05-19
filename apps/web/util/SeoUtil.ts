import { getResizedUrl } from "../components/helperFunctions/HelperFunctions"
import { SeoProps } from "../components/util/SEO"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"

export const getStreamMetaInfo = (stream: LivestreamEvent): SeoProps => {
   return {
      title: `CareerFairy | Live Stream with ${stream.company}`,
      image: {
         url: getResizedUrl(stream.backgroundImageUrl, "sm"),
         width: 400,
         height: 400,
      },
      description: stream.title,
      twitter: {
         cardType: "summary_large_image",
         site: "@FairyCareer",
         handle: "@FairyCareer",
      },
   }
}
