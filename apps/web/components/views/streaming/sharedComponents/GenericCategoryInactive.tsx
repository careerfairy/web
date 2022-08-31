import { Typography } from "@mui/material"
import { CategoryContainerCentered } from "materialUI/GlobalContainers"
import { GreyPermanentMarker } from "materialUI/GlobalTitles"
import { sxStyles } from "../../../../types/commonTypes"
import Box from "@mui/material/Box"

type Props = {
   title: string
   subtitle?: string
}

const styles = sxStyles({
   container: {
      width: "100% !important",
      display: "grid",
      placeItems: "center",
   },
   subtitle: {
      color: "grey !important",
   },
   title: { width: "100% !important" },
})

const GenericCategoryInactive = ({ title, subtitle }: Props) => {
   return (
      <CategoryContainerCentered>
         <div style={styles.container}>
            <Box mb={2}>
               <GreyPermanentMarker className={undefined} sx={styles.title}>
                  {title}
               </GreyPermanentMarker>
            </Box>
            {subtitle && (
               <Typography align="center" gutterBottom sx={styles.subtitle}>
                  {subtitle}
               </Typography>
            )}
         </div>
      </CategoryContainerCentered>
   )
}

export default GenericCategoryInactive
