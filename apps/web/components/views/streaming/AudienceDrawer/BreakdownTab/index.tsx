import { UserLivestreamData } from "@careerfairy/shared-lib/dist/livestreams"
import { Grid } from "@mui/material"
import makeStyles from "@mui/styles/makeStyles"
import { useMemo } from "react"
import { isEmpty, isLoaded } from "react-redux-firebase"
import EmptyDisplay from "../displays/EmptyDisplay"
import LoadingDisplay from "../displays/LoadingDisplay"
import AudienceCategoryChart from "./AudienceCategoryChart"
import TalentPoolPercentage from "./TalentPoolPercentage"

const useStyles = makeStyles((theme) => ({
   root: {
      padding: theme.spacing(1),
   },
}))

interface Props {
   audience: UserLivestreamData[]
}

const BreakdownTab = ({ audience }: Props) => {
   const classes = useStyles()

   const talentPoolPercentage = useMemo(() => {
      const totalCount = audience.length
      const inTalentPoolCount = audience.filter(
         (user) => user.talentPool?.date
      ).length
      const percentage = (inTalentPoolCount / totalCount) * 100
      return isNaN(percentage) ? 0 : Math.round(percentage)
   }, [audience])

   const users = useMemo(() => audience.map((data) => data.user), [audience])

   if (!isLoaded(audience)) {
      return <LoadingDisplay />
   }
   if (isEmpty(audience)) {
      return <EmptyDisplay />
   }

   return (
      <Grid container className={classes.root} spacing={1}>
         <Grid item xs={12}>
            <TalentPoolPercentage percentage={talentPoolPercentage} />
         </Grid>
         <Grid item xs={12}>
            <AudienceCategoryChart audience={users} />
         </Grid>
      </Grid>
   )
}

export default BreakdownTab
