import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { getSubstringWithEllipsis } from "@careerfairy/shared-lib/utils"
import { getResizedUrl } from "../components/helperFunctions/HelperFunctions"
import { SeoProps } from "../components/util/SEO"
import DateUtil from "./DateUtil"

export const getStreamMetaInfo = (stream: LivestreamEvent): SeoProps => {
   const streamDate = stream.startDate
      ? stream.startDate
      : stream.start
      ? stream.start.toDate?.()
      : new Date()

   const monthAndYear = DateUtil.monthAndDay(streamDate)

   return {
      title: `${stream.title} - ${monthAndYear} | CareerFairy`,
      image: {
         url: getResizedUrl(stream.backgroundImageUrl, "sm"),
         width: 400,
         height: 400,
      },
      description: getSubstringWithEllipsis(
         `${stream.title || ""} - ${stream.summary || ""}`,
         160
      ),
      twitter: {
         cardType: "summary_large_image",
         site: "@FairyCareer",
         handle: "@FairyCareer",
      },
      additionalMetaTags: [
         {
            name: "keywords",
            content:
               getStreamText(stream).split(" ").join(",") +
               ",careerfairy,career,fairy,fairycareer,CareerFairy,Career Fair",
         },
      ],
   }
}

const getStreamText = (stream: LivestreamEvent): string => {
   return `${stream.title || ""} ${stream.company || ""} ${
      stream.summary || ""
   }`
}
