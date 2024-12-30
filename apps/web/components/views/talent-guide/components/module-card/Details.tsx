import { Stack, Typography } from "@mui/material"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import { TalentGuideModule } from "data/hygraph/types"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      color: "neutral.800",
      textAlign: "left",
   },
   title: {
      color: "inherit",
      fontWeight: 700,
   },
   description: {
      color: "inherit",
      ...getMaxLineStyles(5),
   },
})

type Props = {
   module: TalentGuideModule
}

export const Details = ({ module }: Props) => {
   return (
      <Stack spacing={0.5} sx={styles.root}>
         <Typography variant="medium" component="h3" sx={styles.title}>
            {module.moduleName}
         </Typography>
         <Typography variant="small" component="p" sx={styles.description}>
            {module.moduleDescription}
         </Typography>
      </Stack>
   )
}
