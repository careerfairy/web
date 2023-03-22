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
   loading?: boolean
}
export const SourcesProgress = ({
   sources,
   rightHeaderTitle,
   leftHeaderTitle,
   loading,
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
            <SourceEntry loading={loading} key={s.name} {...s} />
         ))}
      </Grid>
   )
}
export type SourceEntryArgs = {
   name: string
   help: string
   value: number
   percent: number
   loading?: boolean
}
const SourceEntry = ({
   name,
   value,
   percent,
   help,
   loading,
}: SourceEntryArgs) => {
   return (
      <>
         <Grid item xs={9}>
            <Tooltip title={help} placement="top" followCursor>
               <Typography sx={styles.sourceText}>
                  {loading ? (
                     <Skeleton width={"5rem"} variant={"text"} />
                  ) : (
                     name
                  )}
               </Typography>
            </Tooltip>
         </Grid>
         <Grid item xs={3} textAlign="right">
            <Typography sx={styles.sourceText}>
               {loading ? (
                  <Box
                     ml={"auto"}
                     component={Skeleton}
                     width={"3rem"}
                     variant={"text"}
                  />
               ) : (
                  value
               )}
            </Typography>
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
      backgroundColor: theme.palette.tertiary.main,
   },
   [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      backgroundColor: "primary",
   },
}))
