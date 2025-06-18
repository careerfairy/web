import { getLocationIds } from "@careerfairy/shared-lib/countries/types"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { useMemo } from "react"
import { makeGroupCompanyPageUrl } from "util/makeUrls"
import { getResizedUrl } from "../../helperFunctions/HelperFunctions"

interface CustomJobSEOProps {
   job: CustomJob
}

export const CustomJobSEOSchemaScriptTag = ({ job }: CustomJobSEOProps) => {
   const jobSchema = useMemo(() => {
      const group = job.group
      const logoUrl = group?.logoUrl
         ? getResizedUrl(group.logoUrl, "md")
         : undefined

      const defaultJobLocation = {
         "@type": "Place",
         address: {
            "@type": "PostalAddress",
            addressCountry: group.companyCountry?.id,
         },
      }

      const jobLocations = job.jobLocation
         ? job.jobLocation.map((loc) => ({
              "@type": "Place",
              address: {
                 "@type": "PostalAddress",
                 addressLocality: loc.name,
                 addressCountry: getLocationIds(loc.id).countryIsoCode,
              },
           }))
         : [defaultJobLocation]

      const baseSalary = job.salary
         ? {
              "@type": "MonetaryAmount",
              currency: group.companyCountry?.id !== "CH" ? "EUR" : "CHF",
              value: {
                 "@type": "QuantitativeValue",
                 value: job.salary.replace(/[^0-9.-]+/g, ""),
                 unitText: "YEAR", // Could be improved if you have more info
              },
           }
         : undefined

      const jobDeadline = job.deadline?.toDate?.()?.toISOString?.()
      const datePosted = job.createdAt?.toDate?.()?.toISOString?.()

      return {
         "@type": "JobPosting",
         "@context": "https://schema.org",
         baseSalary,
         datePosted,
         description: job.description,
         directApply: true,
         hiringOrganization: {
            "@type": "Organization",
            name: group?.universityName,
            sameAs: makeGroupCompanyPageUrl(group.universityName, {
               interactionSource: "TDB-APPROPRIATE-SOURCE",
            }),
            logo: logoUrl,
         },
         jobLocation: jobLocations?.at(0),
         title: job.title,
         validThrough: jobDeadline,
         // Additional fields can be added, current example is based on a job from Indeed
      }
   }, [job])

   return (
      <script
         type="application/ld+json"
         dangerouslySetInnerHTML={{
            __html: JSON.stringify(jobSchema),
         }}
      />
   )
}
