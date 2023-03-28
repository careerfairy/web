import {
   Box,
   Grid,
   LinearProgress,
   linearProgressClasses,
   Skeleton,
   styled,
   Tooltip,
   Typography,
} from "@mui/material"
import { sxStyles } from "../../../../../types/commonTypes"
import { FC, ReactNode } from "react"
import { dynamicSort } from "@careerfairy/shared-lib/utils"

const styles = sxStyles({
   header: {
      fontSize: "1.143rem",
      fontWeight: 600,
   },
   sourceText: {
      fontSize: "1rem",
   },
   grid: {
      "& .MuiGrid-item:last-child": {
         marginBottom: 0,
      },
   },
})
type Props = {
   leftHeaderComponent: ReactNode
   rightHeaderComponent: ReactNode

   sources: SourceEntryArgs[]
}

const spacing = 0.5
export const SourcesProgress = ({
   sources,
   rightHeaderComponent,
   leftHeaderComponent,
}: Props) => {
   return (
      <Grid mt={1} sx={styles.grid} spacing={spacing} container>
         <Grid item xs={6}>
            {leftHeaderComponent}
         </Grid>
         <Grid item xs={6}>
            {rightHeaderComponent}
         </Grid>

         {sources.map((s) => (
            <SourceEntry key={s.name} {...s} />
         ))}
      </Grid>
   )
}

type LoadingProps = {
   numberOfSources: number
   leftHeaderComponent?: ReactNode
   rightHeaderComponent?: ReactNode
}
export const LoadingSourcesProgress: FC<LoadingProps> = ({
   numberOfSources,
   leftHeaderComponent,
   rightHeaderComponent,
}) => {
   return (
      <Grid mt={1} sx={styles.grid} spacing={spacing} container>
         <Grid item xs={6}>
            {leftHeaderComponent}
         </Grid>
         <Grid item xs={6}>
            {rightHeaderComponent}
         </Grid>

         {Array.from({ length: numberOfSources }).map((_, i) => (
            <LoadingSourceEntry key={i} />
         ))}
      </Grid>
   )
}

export type SourceEntryArgs = {
   name: string
   help: string
   value: number
   percent: number
}
const SourceEntry = ({ name, value, percent, help }: SourceEntryArgs) => {
   return (
      <>
         <Grid item xs={9}>
            <Tooltip title={help} placement="top" followCursor>
               <Typography sx={styles.sourceText}>{name}</Typography>
            </Tooltip>
         </Grid>
         <Grid item xs={3} textAlign="right">
            <Typography sx={styles.sourceText}>{value}</Typography>
         </Grid>
         <Grid mt={1} mb={2} item xs={12}>
            <BorderLinearProgress
               variant="determinate"
               color="primary"
               value={percent}
            />
         </Grid>
      </>
   )
}

const LoadingSourceEntry = () => {
   return (
      <>
         <Grid item xs={9}>
            <Typography sx={styles.sourceText}>
               <Skeleton width={"5rem"} variant={"text"} />
            </Typography>
         </Grid>
         <Grid item xs={3} textAlign="right">
            <Typography sx={styles.sourceText}>
               <Box
                  ml={"auto"}
                  component={Skeleton}
                  width={"3rem"}
                  variant={"text"}
               />
            </Typography>
         </Grid>
         <Grid mt={1} mb={2} item xs={12}>
            <BorderLinearProgress
               variant="determinate"
               color="primary"
               value={0}
            />
         </Grid>
      </>
   )
}

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
   height: 12,
   borderRadius: 5,
   [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor: theme.palette.tertiary.main,
   },
   [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      backgroundColor: "primary",
   },
}))

export const SourcesProgressTitle = styled(Typography)(() => ({
   fontSize: "1.143rem",
   fontWeight: 600,
})) as typeof Typography

/**
 * Updates existing entries or add new entries to the array
 *
 * @param entries - array of existing entries
 * @param name - name of the entry to be updated or added
 * @param value - value to be added to the entry
 * @param help - tooltip text
 * @returns void - directly updates the entries array
 * */
export const updateEntries = (
   entries: SourceEntryArgs[],
   name: string,
   value: number,
   help: string
) => {
   const entry = entries.find((entry) => entry.name === name)

   if (entry) {
      entry.value += value
   } else {
      entries.push({
         name,
         value,
         percent: 0,
         help,
      })
   }
}

/**
 *  Sorts the entries by value in descending order
 *  Filters out entries with value 0
 *  Calculates the percentage of each entry
 *  Returns the updated entries
 *  @param entries - array of entries
 *  @returns SourceEntryArgs[] - updated entries array with percentage
 * */
export const sortAndFilterAndCalculatePercentage = (
   entries: SourceEntryArgs[]
) => {
   return entries
      .sort(dynamicSort("value", "desc"))
      .filter((entry) => entry.value > 0)
      .map((entry) => {
         entry.percent = calculatePercentage(entry, entries[0].value) // first entry is the highest value as it is sorted by value
         return entry
      })
}

/**
 *  Helper function to calculate percentage
 *  @param entry - entry to calculate percentage for
 *  @param highestValueByCategory - highest value in the category to calculate percentage for
 *  @returns number - percentage
 * */
const calculatePercentage = (
   entry: SourceEntryArgs,
   highestValueByCategory = 0
) => {
   return highestValueByCategory > 0
      ? (entry.value / highestValueByCategory) * 100
      : 0
}
