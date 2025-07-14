import {
   CustomJob,
   jobTypeLookupMap,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { stripHtml } from "@careerfairy/shared-lib/utils"
import { useMemo } from "react"
import { makeGroupCompanyPageUrl } from "util/makeUrls"
import {
   getBaseUrl,
   getResizedUrl,
} from "../../helperFunctions/HelperFunctions"

interface CustomJobSEOProps {
   job: CustomJob
}

export const CustomJobSEOSchemaScriptTag = ({ job }: CustomJobSEOProps) => {
   const jobSchema = useMemo(() => {
      // Extract all data using utility functions
      const logoUrl = getLogoUrl(job.group)
      const jobLocations = getJobLocations(job)
      const baseSalary = getBaseSalaryData(job)
      const employmentType = getEmploymentTypeData(job)
      const industry = getIndustryData(job)
      const { jobDeadline, datePosted } = getJobDates(job)
      const jobUrl = getJobUrl(job)
      const jobLocationType = getJobLocationType(job)
      const { schemaJobLocation, applicantLocationRequirements } =
         getLocationData(job, jobLocations)
      const hiringOrganization = getHiringOrganizationData(job, logoUrl)
      const potentialAction = getPotentialActionData(job)

      // Build schema object
      return {
         "@context": "https://schema.org",
         "@type": "JobPosting",
         identifier: {
            "@type": "PropertyValue",
            name: "CareerFairy",
            value: job.id,
         },
         baseSalary,
         datePosted,
         description: stripHtml(job.description),
         directApply: false,
         jobLocationType,
         jobLocation: schemaJobLocation,
         applicantLocationRequirements,
         potentialAction,
         employmentType,
         hiringOrganization,
         industry,
         url: jobUrl,
         title: job.title,
         validThrough: jobDeadline,
      }
   }, [job])

   return (
      <script
         type="application/ld+json"
         dangerouslySetInnerHTML={{
            __html: JSON.stringify(stripUndefined(jobSchema)),
         }}
      />
   )
}

// Utility functions for schema generation
const getLogoUrl = (group: CustomJob["group"]) => {
   return group?.logoUrl ? getResizedUrl(group.logoUrl, "md") : undefined
}

const getJobLocations = (job: CustomJob) => {
   const group = job.group
   const defaultJobLocation = {
      "@type": "Place",
      address: {
         "@type": "PostalAddress",
         addressCountry: group.companyCountry?.name,
      },
   }

   return job.jobLocation
      ? job.jobLocation.map((loc) => ({
           "@type": "Place",
           address: {
              "@type": "PostalAddress",
              addressLocality: loc.name,
              addressCountry: loc.name,
           },
        }))
      : [defaultJobLocation]
}

const getBaseSalaryData = (job: CustomJob) => {
   if (!job.salary) return undefined

   const group = job.group
   return {
      "@type": "MonetaryAmount",
      currency: group.companyCountry?.id !== "CH" ? "EUR" : "CHF",
      value: {
         "@type": "QuantitativeValue",
         value: job.salary.replace(/[^0-9.-]+/g, ""),
         unitText: "YEAR", // Could be improved if you have more info
      },
   }
}

const getEmploymentTypeData = (job: CustomJob) => {
   return job.jobType ? jobTypeLookupMap[job.jobType] : null
}

const getIndustryData = (job: CustomJob) => {
   return job?.group?.companyIndustries?.at(0)
      ? {
           "@type": "DefinedTerm",
           name: job?.group?.companyIndustries?.at(0).name,
        }
      : null
}

const getJobDates = (job: CustomJob) => {
   return {
      jobDeadline: job.deadline?.toDate?.()?.toISOString?.(),
      datePosted: job.createdAt?.toDate?.()?.toISOString?.(),
   }
}

const getJobUrl = (job: CustomJob) => {
   return `${getBaseUrl()}/jobs?currentJobId=${job.id}`
}

const getJobLocationType = (job: CustomJob) => {
   return job.workplace === "remote" ? "TELECOMMUTE" : undefined
}

const getLocationData = (job: CustomJob, jobLocations: any[]) => {
   const group = job.group
   const countryName = group.companyCountry?.name || "Switzerland"

   let schemaJobLocation
   let applicantLocationRequirements

   if (job.workplace === "remote") {
      // Fully remote jobs: no physical job location, only applicant location requirements
      applicantLocationRequirements = {
         "@type": "Country",
         name: countryName,
      }
   } else if (job.workplace === "hybrid") {
      // Hybrid jobs: both physical location AND applicant location requirements
      schemaJobLocation = jobLocations
      applicantLocationRequirements = {
         "@type": "Country",
         name: countryName,
      }
   } else {
      // On-site jobs: only physical job location
      schemaJobLocation = jobLocations
   }

   return { schemaJobLocation, applicantLocationRequirements }
}

const getHiringOrganizationData = (
   job: CustomJob,
   logoUrl: string | undefined
) => {
   return {
      "@type": "Organization",
      name: job.group?.universityName,
      sameAs: makeGroupCompanyPageUrl(job.group.universityName),
      logo: logoUrl,
   }
}

const getPotentialActionData = (job: CustomJob) => {
   return {
      "@type": "ApplyAction",
      target: {
         "@type": "EntryPoint",
         urlTemplate: job.postingUrl, // external URL
         actionPlatform: [
            "http://schema.org/DesktopWebPlatform",
            "http://schema.org/AndroidPlatform",
            "http://schema.org/IOSPlatform",
         ],
      },
   }
}

const stripUndefined = (o) =>
   JSON.parse(
      JSON.stringify(o, (_, v) =>
         v === undefined || v === null ? undefined : v
      )
   )
