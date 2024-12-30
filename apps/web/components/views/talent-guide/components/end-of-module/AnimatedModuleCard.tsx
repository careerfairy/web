import { Box } from "@mui/material"
import { TalentGuideModule } from "data/hygraph/types"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      padding: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "12px",
      borderRadius: "12px",
      border: (theme) => `1px solid ${theme.palette.secondary[50]}`,
   },
})

type Props = {
   module: TalentGuideModule
}

export const AnimatedModuleCard = ({ module }: Props) => {
   return <Box sx={styles.root}>AnimatedModuleCard</Box>
}
