import React, { useMemo } from "react"
import makeStyles from "@mui/styles/makeStyles"
import { useCurrentStream } from "../../../../../context/stream/StreamContext"
import { Grid } from "@mui/material"
import TalentPoolPercentage from "./TalentPoolPercentage"
import AudienceCategoryChart from "./AudienceCategoryChart"
import { isEmpty, isLoaded } from "react-redux-firebase"
import LoadingDisplay from "../displays/LoadingDisplay"
import EmptyDisplay from "../displays/EmptyDisplay"
import {
   LivestreamUserAction,
   UserLivestreamData,
} from "@careerfairy/shared-lib/dist/livestreams"

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
   const {
      currentLivestream: { talentPool },
   } = useCurrentStream()

   const talentPoolPercentage = useMemo(() => {
      const totalCount = audience.length
      const inTalentPoolCount = audience.filter((user) =>
         // @ts-ignore
         user.userHas?.includes("joinedTalentPool" as LivestreamUserAction)
      ).length
      const percentage = (inTalentPoolCount / totalCount) * 100
      return isNaN(percentage) ? 0 : Math.round(percentage)
   }, [audience, talentPool])

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
            <AudienceCategoryChart audience={audience} />
         </Grid>
      </Grid>
   )
}

export default BreakdownTab
