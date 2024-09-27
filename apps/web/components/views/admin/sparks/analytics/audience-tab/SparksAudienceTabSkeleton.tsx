import { Grid } from "@mui/material"
import { PieChartsSkeleton, TopBulletChartsSkeleton } from "./Skeletons"

export const SparksAudienceTabSkeleton = () => {
   return (
      <Grid container spacing={5} marginBottom={10} alignItems="stretch">
         <Grid item xs={12} md={6}>
            <TopBulletChartsSkeleton />
         </Grid>
         <Grid item xs={12} md={6}>
            <TopBulletChartsSkeleton />
         </Grid>
         <Grid item xs={12} md={6}>
            <PieChartsSkeleton />
         </Grid>
         <Grid item xs={12} md={6}>
            <PieChartsSkeleton />
         </Grid>
      </Grid>
   )
}
