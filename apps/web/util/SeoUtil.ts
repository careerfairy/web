import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { getSubstringWithEllipsis } from "@careerfairy/shared-lib/utils"
import keywordExtractor from "keyword-extractor"
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
               keywordExtractor
                  .extract(getStreamText(stream), {
                     language: getLanguageName(stream.language?.code),
                     remove_digits: true,
                     return_changed_case: true,
                     remove_duplicates: true,
                  })
                  .join(",") +
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
export type KeywordExtractorLanguageNames =
   | "danish"
   | "dutch"
   | "english"
   | "french"
   | "galician"
   | "german"
   | "italian"
   | "polish"
   | "portuguese"
   | "romanian"
   | "russian"
   | "spanish"
   | "swedish"

const getLanguageName = (
   languageCode: string
): KeywordExtractorLanguageNames => {
   switch (languageCode) {
      case "da":
         return "danish"
      case "nl":
         return "dutch"
      case "en":
         return "english"
      case "fr":
         return "french"
      case "gl":
         return "galician"
      case "de":
         return "german"
      case "it":
         return "italian"
      case "pl":
         return "polish"
      case "pt":
         return "portuguese"
      case "ro":
         return "romanian"
      case "ru":
         return "russian"
      case "es":
         return "spanish"
      case "sv":
         return "swedish"
      default:
         return "english"
   }
}
