import {
   Box,
   Grid,
   LinearProgress,
   linearProgressClasses,
   LinearProgressProps,
   Skeleton,
   styled,
   Tooltip,
   Typography,
} from "@mui/material"
import { sxStyles } from "../../../../../types/commonTypes"
import { FC, ReactNode } from "react"
import { dynamicSort } from "@careerfairy/shared-lib/utils"
import { getMaxLineStyles } from "../../../../helperFunctions/HelperFunctions"

const styles = sxStyles({
   header: {
      fontSize: "1.143rem",
      fontWeight: 600,
   },
   sourceText: {
      fontSize: "1rem",
      ...getMaxLineStyles(1),
   },
   grid: {
      "& .MuiGrid-item:last-child": {
         marginBottom: 0,
      },
   },
})
type Props = {
   leftHeaderComponent?: ReactNode
   rightHeaderComponent?: ReactNode

   sources: SourceEntryArgs[]
   flat?: boolean
}

const spacing = 0.5
export const SourcesProgress: FC<Props> = (props) => {
   return (
      <Grid
         sx={styles.grid}
         alignItems="center"
         spacing={props.flat ? spacing : 1}
         container
      >
         {props.leftHeaderComponent ? (
            <Grid item xs={6}>
               {props.leftHeaderComponent}
            </Grid>
         ) : null}
         {props.rightHeaderComponent ? (
            <Grid item xs={6}>
               {props.rightHeaderComponent}
            </Grid>
         ) : null}

         {props.sources.map((s) => (
            <SourceEntry flat={props.flat} key={s.name} {...s} />
         ))}
      </Grid>
   )
}

type LoadingProps = Omit<Props, "sources"> & {
   numberOfSources: number
}
export const LoadingSourcesProgress: FC<LoadingProps> = (props) => {
   return (
      <Grid
         mt={1}
         sx={styles.grid}
         spacing={props.flat ? spacing : 1}
         container
      >
         {props.leftHeaderComponent ? (
            <Grid item xs={6}>
               {props.leftHeaderComponent}
            </Grid>
         ) : null}
         {props.rightHeaderComponent ? (
            <Grid item xs={6}>
               {props.rightHeaderComponent}
            </Grid>
         ) : null}

         {Array.from({ length: props.numberOfSources }).map((_, i) => (
            <LoadingSourceEntry flat={props.flat} key={i} />
         ))}
      </Grid>
   )
}

export type SourceEntryArgs = {
   name: string
   help: string
   value: number
   percent: number
   flat?: boolean
}

const normalGridStyles = {
   name: 9,
   value: 3,
   progress: 12,
}

const flatGridStyles = {
   name: 2.5,
   progress: 9,
   value: spacing,
}
const SourceEntry: FC<SourceEntryArgs> = ({
   percent,
   flat,
   value,
   name,
   help,
}) => {
   const gridStyles = flat ? flatGridStyles : normalGridStyles

   return (
      <>
         <Grid item xs={gridStyles.name}>
            <SourceName name={name} help={help} />
         </Grid>
         {flat ? (
            <>
               <Grid item xs={gridStyles.progress}>
                  <SourceProgress flat={flat} percent={percent} />
               </Grid>
               <Grid item xs={gridStyles.value} textAlign="right">
                  <SourceValue value={value} />
               </Grid>
            </>
         ) : (
            <>
               <Grid item xs={gridStyles.value} textAlign="right">
                  <SourceValue value={value} />
               </Grid>
               <Grid item xs={gridStyles.progress}>
                  <SourceProgress percent={percent} />
               </Grid>
            </>
         )}
      </>
   )
}

const LoadingSourceEntry: FC<{
   flat?: boolean
}> = (props) => {
   const { flat = false } = props

   const gridStyles = flat ? flatGridStyles : normalGridStyles

   return (
      <>
         <Grid item xs={gridStyles.name}>
            <SourceName
               name={<Skeleton width={flat ? "80%" : "5rem"} variant="text" />}
            />
         </Grid>
         {flat ? (
            <>
               <Grid item xs={gridStyles.progress}>
                  <SourceProgress flat={flat} percent={0} />
               </Grid>
               <Grid item xs={gridStyles.value} textAlign="right">
                  <SourceValue
                     value={
                        <Box
                           ml="auto"
                           component={Skeleton}
                           width="3rem"
                           variant="text"
                        />
                     }
                  />
               </Grid>
            </>
         ) : (
            <>
               <Grid item xs={gridStyles.value} textAlign="right">
                  <SourceValue
                     value={
                        <Box
                           ml="auto"
                           component={Skeleton}
                           width="3rem"
                           variant="text"
                        />
                     }
                  />
               </Grid>
               <Grid item xs={gridStyles.progress}>
                  <SourceProgress flat={flat} percent={0} />
               </Grid>
            </>
         )}
      </>
   )
}

const SourceName = ({ name, help }: { name: ReactNode; help?: string }) => (
   <Tooltip title={help || ""} placement="top" followCursor>
      <Typography whiteSpace={"pre-line"} sx={styles.sourceText}>
         {name}
      </Typography>
   </Tooltip>
)

const SourceProgress = ({
   percent,
   flat,
}: {
   percent: number
   flat?: boolean
}) => (
   <BorderLinearProgress
      variant="determinate"
      color="primary"
      flat={flat}
      value={percent}
   />
)

const SourceValue = ({ value }: { value: ReactNode }) => (
   <Typography sx={styles.sourceText}>{value}</Typography>
)

interface StyledLinearProgressProps extends LinearProgressProps {
   flat?: boolean
}
const BorderLinearProgress = styled(LinearProgress, {
   shouldForwardProp: (prop) => prop !== "flat",
})<StyledLinearProgressProps>(({ theme, flat }) => ({
   height: flat ? 8 : 12,
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
