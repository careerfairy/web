import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box, Stack } from "@mui/material"
import Typography from "@mui/material/Typography"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { sxStyles } from "../../../../../types/commonTypes"
import DateUtil from "../../../../../util/DateUtil"
import SanitizedHTML from "../../../../util/SanitizedHTML"
import CustomJobHeader from "../custom-jobs/CustomJobHeader"
import LinkedContentDetails from "./LinkedContentDetails"

const styles = sxStyles({
   wrapper: {
      p: 2,
   },
   subTitle: {
      fontSize: "18px",
      fontWeight: 600,
   },
   jobValues: {
      fontSize: "16px",
   },
   content: {
      mt: 4,
   },
   description: {
      fontSize: "16px",
      fontWeight: 400,
      color: (theme) => theme.palette.text.secondary,
   },
})

type Props = {
   job: CustomJob
   handleEdit?: () => void
   companyName: string
   companyLogoUrl: string
}
const CustomJobAdminDetails = ({
   job,
   handleEdit,
   companyName,
   companyLogoUrl,
}: Props) => {
   const { description, salary, deadline } = job

   const jobDeadline = deadline
      ? DateUtil.formatDateToString(deadline.toDate())
      : ""

   return (
      <Box sx={styles.wrapper}>
         <CustomJobHeader
            job={job}
            companyName={companyName}
            companyLogoUrl={companyLogoUrl}
            editMode={!!handleEdit}
            handleClick={handleEdit}
            maxLocationsToShow={1}
         />

         <Box sx={styles.content}>
            <Stack spacing={2}>
               <Box>
                  <Typography variant={"subtitle1"} sx={styles.subTitle}>
                     Job description
                  </Typography>
                  <SanitizedHTML
                     sx={styles.description}
                     htmlString={description}
                  />
               </Box>

               {salary ? (
                  <Box>
                     <Typography variant={"subtitle1"} sx={styles.subTitle}>
                        Salary
                     </Typography>
                     <Typography variant={"body1"} sx={styles.jobValues}>
                        {salary}
                     </Typography>
                  </Box>
               ) : null}

               {jobDeadline ? (
                  <Box>
                     <Typography variant={"subtitle1"} sx={styles.subTitle}>
                        Application deadline
                     </Typography>
                     <Typography variant={"body1"} sx={styles.jobValues}>
                        {jobDeadline}
                     </Typography>
                  </Box>
               ) : null}

               <SuspenseWithBoundary fallback={<></>}>
                  <LinkedContentDetails job={job} />
               </SuspenseWithBoundary>
            </Stack>
         </Box>
      </Box>
   )
}

export default CustomJobAdminDetails
