import { Box, Button, Typography, useMediaQuery } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import FramerBox from "components/views/common/FramerBox"
import Link from "components/views/common/Link"
import { Page, TalentGuideModule } from "data/hygraph/types"
import { AnimatePresence } from "framer-motion"
import { Fragment, useEffect, useRef, useState } from "react"
import { Play } from "react-feather"
import { useModuleData } from "store/selectors/talentGuideSelectors"
import { ModuleCard } from "../module-card/ModuleCard"
import {
   bottomContentVariants,
   dividerVariants,
   nextModuleVariants,
} from "./animations"
import { nextModuleStyles } from "./styles"
import { useDelayedValue } from "./useDelayedValue"

type Props = {
   nextModule: Page<TalentGuideModule> | null
}

const SHRINK_FACTOR = 0.7

type AnimationsState = {
   hasShineAnimationComplete: boolean
   hasCompletedModuleCardSlidUp: boolean
   hasNextModuleCardAppeared: boolean
   hasDividerAnimationComplete: boolean
}

export const NextModuleSection = ({ nextModule }: Props) => {
   const [animationsState, setAnimationsState] = useState<AnimationsState>({
      hasShineAnimationComplete: false,
      hasCompletedModuleCardSlidUp: false,
      hasDividerAnimationComplete: false,
      hasNextModuleCardAppeared: false,
   })

   const moduleData = useModuleData()

   const [cardOffset, setCardOffset] = useState(0)

   const isShortScreen = useMediaQuery("(max-height: 745px)")
   const isMobile = useIsMobile()

   const completedCardRef = useRef<HTMLDivElement>(null)
   const dividerRef = useRef<HTMLDivElement>(null)

   useEffect(() => {
      return () => {
         setAnimationsState({
            hasShineAnimationComplete: false,
            hasDividerAnimationComplete: false,
            hasCompletedModuleCardSlidUp: false,
            hasNextModuleCardAppeared: false,
         })
         setCardOffset(0)
      }
   }, [])

   useEffect(() => {
      if (
         completedCardRef.current &&
         dividerRef.current &&
         animationsState.hasShineAnimationComplete
      ) {
         const cardHeight =
            completedCardRef.current.getBoundingClientRect().height

         const scaledHeight = cardHeight * SHRINK_FACTOR

         const offset = (cardHeight - scaledHeight) / 2

         setCardOffset(offset)
      }
   }, [animationsState.hasShineAnimationComplete])

   const hasCompletedModuleCardSlidUp = useDelayedValue(
      animationsState.hasCompletedModuleCardSlidUp,
      500
   )

   return (
      <FramerBox
         animate={"animate"}
         initial="initial"
         exit="exit"
         transition={{ duration: 0.5, ease: "easeOut" }}
         variants={nextModuleVariants}
         sx={nextModuleStyles.section}
         data-testid="next-module-section"
      >
         <AnimatePresence mode="popLayout">
            <FramerBox
               layout
               initial={{ scale: 1, y: 0 }}
               animate={{
                  scale: animationsState.hasShineAnimationComplete
                     ? SHRINK_FACTOR
                     : 1,
                  y: animationsState.hasShineAnimationComplete ? cardOffset : 0,
               }}
               transition={{ duration: 0.5 }}
               key="completed-module-card"
               sx={[
                  nextModuleStyles.completedModuleCard,
                  animationsState.hasShineAnimationComplete &&
                     nextModuleStyles.slideUp,
                  isShortScreen && {
                     top: "20%",
                  },
               ]}
               onLayoutAnimationComplete={() => {
                  setAnimationsState((prev) => ({
                     ...prev,
                     hasCompletedModuleCardSlidUp: true,
                  }))
               }}
            >
               <ModuleCard
                  ref={completedCardRef}
                  module={moduleData}
                  onShineAnimationComplete={() => {
                     setAnimationsState((prev) => ({
                        ...prev,
                        hasShineAnimationComplete: true,
                     }))
                  }}
               />
            </FramerBox>
            <FramerBox
               variants={{
                  initial: {
                     opacity: 0,
                  },
                  animate: {
                     opacity: 1,
                  },
               }}
               layout
               animate={
                  Boolean(animationsState.hasCompletedModuleCardSlidUp) &&
                  "animate"
               }
               initial="initial"
               display="flex"
               flexDirection="column"
               alignItems="center"
               onLayoutAnimationComplete={() => {
                  setAnimationsState((prev) => ({
                     ...prev,
                     hasNextModuleCardAppeared: true,
                  }))
               }}
               sx={{
                  paddingBottom: isShortScreen
                     ? 2
                     : isMobile
                     ? undefined
                     : "20%",
               }}
            >
               <FramerBox
                  key="divider-container"
                  ref={dividerRef}
                  variants={dividerVariants}
                  animate={
                     animationsState.hasCompletedModuleCardSlidUp
                        ? "animate"
                        : "initial"
                  }
                  sx={nextModuleStyles.divider}
                  layout
                  onLayoutAnimationComplete={() => {
                     setTimeout(() => {
                        setAnimationsState((prev) => ({
                           ...prev,
                           hasDividerAnimationComplete: true,
                        }))
                     }, 500)
                  }}
               />
               <Box px={-3} mx={3}>
                  <ModuleCard
                     isRecommended={
                        hasCompletedModuleCardSlidUp ||
                        animationsState.hasDividerAnimationComplete
                     }
                     module={nextModule}
                  />
               </Box>
            </FramerBox>
         </AnimatePresence>
         <FramerBox
            key="bottom-content"
            layout
            sx={nextModuleStyles.bottomContent}
            variants={bottomContentVariants}
         >
            <BottomContent nextModule={nextModule} />
         </FramerBox>
      </FramerBox>
   )
}

type BottomContentProps = {
   nextModule: Page<TalentGuideModule> | null
}

const BottomContent = ({ nextModule }: BottomContentProps) => {
   return (
      <Fragment>
         <Typography
            variant="desktopBrandedH3"
            sx={nextModuleStyles.bottomTitle}
            component="h3"
         >
            Bock auf mehr?
         </Typography>
         <Typography
            variant="medium"
            sx={nextModuleStyles.bottomText}
            component="p"
         >
            Top! Mit nur einem Klick geht&apos;s weiter auf deiner persönlichen
            Job Journey.
         </Typography>
         <Button
            color="primary"
            variant="contained"
            size="large"
            endIcon={<Play />}
            fullWidth
            component={Link}
            noLinkStyle
            href={nextModule ? `/levels/${nextModule.slug}` : "/levels"}
            sx={nextModuleStyles.bottomButton}
         >
            Nächstes Level starten
         </Button>
      </Fragment>
   )
}
