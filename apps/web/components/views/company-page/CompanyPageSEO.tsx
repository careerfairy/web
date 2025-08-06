import { SerializedGroup } from "@careerfairy/shared-lib/groups"
import { stripHtml } from "@careerfairy/shared-lib/utils"
import { deserializeGroupClient } from "../../../util/serverUtil"
import { getResizedUrl } from "../../helperFunctions/HelperFunctions"
import SEO from "../../util/SEO"

export type CompanyPageType =
   | "overview"
   | "recordings"
   | "livestreams"
   | "jobs"
   | "mentors"
   | "sparks"
   | "mentor-detail"

interface CompanyPageSEOProps {
   serverSideGroup: SerializedGroup
   pageType: CompanyPageType
   mentorName?: string
   customDescription?: string
}

const PAGE_CONFIG = {
   overview: {
      titleSuffix: "",
      descriptionTemplate: (company: string) =>
         `Discover career opportunities and events at ${company}.`,
      ogTitleTemplate: (company: string) =>
         `${company} Company Page | CareerFairy`,
      type: "website" as const,
   },
   recordings: {
      titleSuffix: " | Live stream recordings",
      descriptionTemplate: (company: string) =>
         `Watch live stream recordings of ${company} with CareerFairy`,
      ogTitleTemplate: (company: string) =>
         `${company} Recordings | CareerFairy`,
      type: "website" as const,
   },
   livestreams: {
      titleSuffix: " | Live streams",
      descriptionTemplate: (company: string) =>
         `Watch live streams of ${company} with CareerFairy`,
      ogTitleTemplate: (company: string) =>
         `${company} Live Streams | CareerFairy`,
      type: "website" as const,
   },
   jobs: {
      titleSuffix: " | Jobs",
      descriptionTemplate: (company: string) =>
         `Find your dream job at ${company} with CareerFairy`,
      ogTitleTemplate: (company: string) => `${company} Jobs | CareerFairy`,
      type: "website" as const,
   },
   mentors: {
      titleSuffix: " | Mentors",
      descriptionTemplate: (company: string) =>
         `Meet mentors of ${company} with CareerFairy`,
      ogTitleTemplate: (company: string) => `${company} Mentors | CareerFairy`,
      type: "website" as const,
   },
   sparks: {
      titleSuffix: " | Sparks",
      descriptionTemplate: (company: string) =>
         `Discover ${company} with CareerFairy sparks`,
      ogTitleTemplate: (company: string) => `${company} Sparks | CareerFairy`,
      type: "website" as const,
   },
   "mentor-detail": {
      titleSuffix: "",
      descriptionTemplate: (company: string, mentorName?: string) =>
         `Meet ${mentorName}, a mentor at ${company}. Connect with industry professionals and grow your career.`,
      ogTitleTemplate: (company: string, mentorName?: string) =>
         `${mentorName} - ${company} Mentor | CareerFairy`,
      type: "profile" as const,
   },
}

export const CompanyPageSEO: React.FC<CompanyPageSEOProps> = ({
   serverSideGroup,
   pageType,
   mentorName,
   customDescription,
}) => {
   const { universityName, description, extraInfo, logoUrl } =
      deserializeGroupClient(serverSideGroup)

   const config = PAGE_CONFIG[pageType]
   const title = `CareerFairy | ${universityName}${config.titleSuffix}`
   const defaultDescription = config.descriptionTemplate(
      universityName,
      mentorName
   )

   const finalDescription =
      customDescription || extraInfo || description || defaultDescription

   return (
      <SEO
         id={title}
         title={title}
         description={finalDescription}
         image={{
            url: getResizedUrl(logoUrl, "lg"),
            width: 1200,
            height: 900,
            alt: `${universityName} logo`,
         }}
         openGraph={{
            type: config.type,
            title: config.ogTitleTemplate(universityName, mentorName),
            description: stripHtml(finalDescription),
            images: [
               {
                  url: getResizedUrl(logoUrl, "lg"),
                  width: 1200,
                  height: 900,
                  alt: `${universityName} logo`,
               },
            ],
         }}
         twitter={{
            cardType: "summary_large_image",
         }}
      />
   )
}
