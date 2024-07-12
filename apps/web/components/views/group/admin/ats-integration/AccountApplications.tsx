import { UserLivestreamData } from "@careerfairy/shared-lib/livestreams"
import MaterialTable from "@material-table/core"
import LinkedInIcon from "@mui/icons-material/LinkedIn"
import Box from "@mui/material/Box"
import { useMemo } from "react"
import useGroupATSApplications from "../../../../custom-hook/useGroupATSApplications"
import { makeExternalLink } from "../../../../helperFunctions/HelperFunctions"
import { LINKEDIN_COLOR } from "../../../../util/colors"
import { useATSAccount } from "./ATSAccountContextProvider"
import { TableTitle } from "./AccountJobs"

const columns = [
   {
      title: "Job",
      field: "jobName",
   },
   {
      title: "Candidate",
      field: "candidateName",
   },
   {
      field: "linkedinUrl",
      title: "LinkedIn",
      filtering: false,
      render: (rowData) => (
         <LinkedInColumnField linkedInUrl={rowData.linkedinUrl} />
      ),
   },
   {
      title: "Applied At",
      field: "appliedAt",
   },
]

const AccountApplications = () => {
   const { atsAccount } = useATSAccount()
   const data = useGroupATSApplications(atsAccount.groupId, atsAccount.id)

   const applicationsToRows = useMemo(() => {
      if (data?.length === 0) {
         return []
      }

      return mapApplicationsToTableRows(data)
   }, [data])

   return (
      <MaterialTable
         columns={columns}
         data={applicationsToRows}
         title={
            <TableTitle
               title="Applications"
               subtitle="All applications from CareerFairy"
            />
         }
      />
   )
}

const LinkedInColumnField = ({ linkedInUrl }) => {
   if (!linkedInUrl) {
      return null
   }

   return (
      <Box>
         <a
            target="_blank"
            href={makeExternalLink(linkedInUrl)}
            style={{ color: LINKEDIN_COLOR }}
            rel="noreferrer"
         >
            <LinkedInIcon />
         </a>
      </Box>
   )
}

type RowData = {
   jobName?: string
   candidateName: string
   appliedAt: string
   linkedinUrl?: string
}

/**
 * Transforms userLivestreamData docs into row data objects
 * Sorts the applications by application date desc
 * @param data
 */
function mapApplicationsToTableRows(data: UserLivestreamData[]): RowData[] {
   return data
      .map((doc) => {
         const applications = []

         for (const jobApplicationsKey in doc.jobApplications) {
            const job = doc.jobApplications[jobApplicationsKey].job
            applications.push({
               jobName: job?.name,
               candidateName: `${doc?.user?.firstName} ${doc?.user?.lastName}`,
               appliedAt:
                  doc.jobApplications[jobApplicationsKey].date?.toDate(),
               linkedinUrl: doc.user?.linkedinUrl,
            })
         }

         return applications
      })
      .flat()
      .sort((a, b) => {
         // sort desc
         if (!a?.appliedAt || !b?.appliedAt) return 0

         return b?.appliedAt?.getTime() - a?.appliedAt?.getTime()
      })
      .map((a) => ({
         ...a,
         appliedAt: a?.appliedAt?.toLocaleString(),
      }))
}

export default AccountApplications
