import {
   Box,
   Grid,
   LinearProgress,
   linearProgressClasses,
   styled,
   Typography,
} from "@mui/material"
import React, { useState } from "react"
import { sxStyles } from "types/commonTypes"
import {
   RegistrationSource,
   VALID_SOURCES,
} from "../../analytics/RegistrationSources/sources"
import CardCustom from "../CardCustom"

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

const CARD_OPTIONS = [
   "All live streams",
   "Last Live stream",
   "Next Live stream",
] as const

export const AggregatedRegistrationSourcesCard = () => {
   const [sortingMethod, setSortingMethod] = useState<
      typeof CARD_OPTIONS[number]
   >(CARD_OPTIONS[0])

   return (
      <CardCustom
         title={"Registration Sources Overview"}
         options={CARD_OPTIONS}
      >
         <Grid mt={1} sx={styles.grid} container>
            <Grid item xs={6}>
               <Typography sx={styles.header}>Channel</Typography>
            </Grid>
            <Grid mb={2} item xs={6} textAlign="right">
               <Typography sx={styles.header}>Users</Typography>
            </Grid>

            {VALID_SOURCES.map((s) => (
               <SourceEntry key={s.displayName} source={s} />
            ))}
         </Grid>
      </CardCustom>
   )
}

const SourceEntry = ({ source }: { source: RegistrationSource }) => {
   const value = Math.round(Math.random() * 20)
   return (
      <>
         <Grid item xs={6}>
            <Typography sx={styles.sourceText}>{source.displayName}</Typography>
         </Grid>
         <Grid item xs={6} textAlign="right">
            <Typography sx={styles.sourceText}>{value}</Typography>
         </Grid>
         <Grid mt={1} mb={2} item xs={12}>
            <BorderLinearProgress
               variant="determinate"
               color="primary"
               value={value}
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
