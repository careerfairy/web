import { Box, Typography } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import CircularLoader from "components/views/loader/CircularLoader"
import { JobsBlockType } from "data/hygraph/types"
import { sxStyles } from "types/commonTypes"
import { JobsBlockProvider } from "./JobsBlockContext"
import { JobsFilter } from "./JobsFilter"
import { JobsList } from "./JobsList"

const styles = sxStyles({
   title: {
      mb: 1.5,
   },
})

type Props = JobsBlockType

export const JobsBlock = ({ title, id }: Props) => {
   return (
      <JobsBlockProvider blockId={id}>
         {Boolean(title) && (
            <Box sx={styles.title}>
               <Typography variant="medium">{title}</Typography>
            </Box>
         )}
         <JobsFilter />
         <SuspenseWithBoundary fallback={<CircularLoader />}>
            <JobsList />
         </SuspenseWithBoundary>
      </JobsBlockProvider>
   )
}
