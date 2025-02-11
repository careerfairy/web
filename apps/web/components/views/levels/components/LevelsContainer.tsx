import {
   swissGermanCountryFilters,
   userIsTargetedLevels,
} from "@careerfairy/shared-lib/countries/filters"
import { Container, Stack } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import useUserCountryCode from "components/custom-hook/useUserCountryCode"
import FramerBox from "components/views/common/FramerBox"
import { Page, TalentGuideModule } from "data/hygraph/types"
import { Variants } from "framer-motion"
import { useAuth } from "HOCs/AuthProvider"
import { useGenericDashboard } from "layouts/GenericDashboardLayout"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { ModuleCard } from "../../talent-guide/components/module-card/ModuleCard"
import { CourseOverview } from "./course-overview/CourseOverview"

const styles = sxStyles({
   root: {
      width: "100%",
      position: "relative",
      minHeight: "100dvh",
      mb: 12,
   },
   desktopRoot: {
      pt: "-3px",
      mt: "3px",
   },
   modulesContainer: {
      flex: 1,
      gap: 2,
   },
})

const containerVariants: Variants = {
   hidden: { opacity: 0 },
   visible: {
      opacity: 1,
      transition: {
         staggerChildren: 0.15,
         delayChildren: 0.1,
      },
   },
}

const itemVariants: Variants = {
   hidden: { opacity: 0, y: 20 },
   visible: {
      opacity: 1,
      y: 0,
      transition: {
         type: "spring",
         stiffness: 300,
         damping: 25,
      },
   },
}

type Props = {
   pages: Page<TalentGuideModule>[]
}

export const LevelsContainer = ({ pages }: Props) => {
   const router = useRouter()
   const isMobile = useIsMobile()
   const { drawerOpen } = useGenericDashboard()
   const { userData, isLoadingUserData } = useAuth()
   const { userCountryCode, isLoading: isLoadingCountry } = useUserCountryCode()
   const [hasStaggerFinished, setHasStaggerFinished] = useState(false)

   const cardsAreMobile = useIsMobile(drawerOpen ? 1110 : undefined)

   useEffect(() => {
      if (isLoadingUserData || isLoadingCountry) return

      const showLevels = userData
         ? userIsTargetedLevels(userData)
         : swissGermanCountryFilters.includes(userCountryCode)

      if (!showLevels) {
         router.push("/campaigns/levels-teaser-en")
      }
   }, [router, userData, userCountryCode, isLoadingUserData, isLoadingCountry])

   return (
      <FramerBox
         component={Container}
         maxWidth="xl"
         variants={containerVariants}
         initial="hidden"
         animate="visible"
         onAnimationComplete={() => setHasStaggerFinished(true)}
         sx={[styles.root, !isMobile && styles.desktopRoot]}
      >
         <Stack spacing={2} direction={isMobile ? "column" : "row"}>
            <CourseOverview isMobile={isMobile} modules={pages} />
            <Stack sx={styles.modulesContainer}>
               {pages.map((page) => (
                  <FramerBox key={page.slug} variants={itemVariants}>
                     <ModuleCard
                        module={page}
                        interactive
                        overrideIsMobile={cardsAreMobile}
                        canAnimate={hasStaggerFinished}
                     />
                  </FramerBox>
               ))}
            </Stack>
         </Stack>
      </FramerBox>
   )
}
