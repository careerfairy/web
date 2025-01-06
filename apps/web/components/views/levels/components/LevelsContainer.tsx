import { Stack } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { Page, TalentGuideModule } from "data/hygraph/types"
import { sxStyles } from "types/commonTypes"
import { ModuleCard } from "../../talent-guide/components/module-card/ModuleCard"
import { CourseOverview } from "./course-overview/CourseOverview"

const styles = sxStyles({
   root: {
      width: "100%",
   },
   modulesContainer: {
      flex: 1,
      gap: 2,
   },
})

type Props = {
   pages: Page<TalentGuideModule>[]
}

export const LevelsContainer = ({ pages }: Props) => {
   const isMobile = useIsMobile("sm")

   return (
      <Stack
         spacing={2}
         direction={isMobile ? "column" : "row"}
         sx={styles.root}
      >
         <CourseOverview pages={pages} />
         <Stack sx={styles.modulesContainer}>
            {pages.map((page) => (
               <ModuleCard key={page.slug} module={page} interactive />
            ))}
         </Stack>
      </Stack>
   )
}
