import {
   Grid,
   LinearProgress,
   linearProgressClasses,
   styled,
   Tooltip,
   Typography,
} from "@mui/material"
import { sxStyles } from "../../../../../types/commonTypes"

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
   leftHeaderTitle: string
   rightHeaderTitle: string

   sources: SourceEntryArgs[]
}
export const SourcesProgress = ({
   sources,
   rightHeaderTitle,
   leftHeaderTitle,
}: Props) => {
   return (
      <Grid mt={1} sx={styles.grid} container>
         <Grid item xs={6}>
            <Typography sx={styles.header}>{leftHeaderTitle}</Typography>
         </Grid>
         <Grid mb={2} item xs={6} textAlign="right">
            <Typography sx={styles.header}>{rightHeaderTitle}</Typography>
         </Grid>

         {sources.map((s) => (
            <SourceEntry key={s.name} {...s} />
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
const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
   height: 12,
   borderRadius: 5,
   [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor: theme.palette.grey[100],
   },
   [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      backgroundColor: "primary",
   },
}))

export function sortSources(a: SourceEntryArgs, b: SourceEntryArgs) {
   const order = [
      "Platform Registrations",
      "Platform User Promo",
      "Social",
      "University Network Promo",
      "Other",
   ]

   const idxFoundA = order.findIndex((o) => o === a.name)
   const idxFoundB = order.findIndex((o) => o === b.name)

   if (idxFoundA >= 0 && idxFoundB >= 0) return idxFoundA - idxFoundB

   return 0
}
