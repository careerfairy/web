import { Button, Typography, useMediaQuery } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import useTraceUpdate from "components/custom-hook/utils/useTraceUpdate"
import FramerBox from "components/views/common/FramerBox"
import { Page, TalentGuideModule } from "data/hygraph/types"
import { AnimatePresence, Variants } from "framer-motion"
import { useRouter } from "next/router"
import { Fragment, useEffect, useRef, useState } from "react"
import { Play } from "react-feather"
import { useModuleData } from "store/selectors/talentGuideSelectors"
import { ModuleCard } from "../module-card/ModuleCard"
import { nextModuleStyles } from "./styles"

type Props = {
   nextModule: Page<TalentGuideModule> | null
}

const SHRINK_FACTOR = 0.7

const dividerVariants: Variants = {
   initial: {
      scaleY: 0,
      originY: 0,
   },
   animate: {
      scaleY: 1,
      transition: {
         duration: 1,
         ease: "easeOut",
      },
   },
}

type AnimationsState = {
   hasShineAnimationComplete: boolean
   hasDividerAnimationComplete: boolean
   hasCompletedModuleCardSlidUp: boolean
   hasNextModuleCardAppeared: boolean
}

export const NextModuleSection = ({ nextModule }: Props) => {
   const [animationsState, setAnimationsState] = useState<AnimationsState>({
      hasShineAnimationComplete: false,
      hasDividerAnimationComplete: false,
      hasCompletedModuleCardSlidUp: false,
      hasNextModuleCardAppeared: false,
   })

   useTraceUpdate(animationsState)

   const moduleData = useModuleData()
   const isMobile = useIsMobile()
   const [cardOffset, setCardOffset] = useState(0)

   const isShortScreen = useMediaQuery("(max-height: 745px)")

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
      if (completedCardRef.current && dividerRef.current) {
         const cardHeight =
            completedCardRef.current.getBoundingClientRect().height
         const scaledHeight = cardHeight * SHRINK_FACTOR
         const offset = (cardHeight - scaledHeight) / 2
         setCardOffset(offset)
      }
   }, [])

   return (
      <FramerBox
         animate={"animate"}
         initial="initial"
         exit="exit"
         transition={{ duration: 0.5, ease: "easeOut" }}
         variants={containerVariants}
         sx={[
            nextModuleStyles.section,
            isShortScreen && nextModuleStyles.shortScreenSection,
         ]}
         data-testid="next-module-section"
      >
         <AnimatePresence mode="sync">
            <FramerBox
               key="completed-module-card"
               ref={completedCardRef}
               layout
               initial={{ scale: 1, y: 0 }}
               animate={{
                  scale: animationsState.hasShineAnimationComplete
                     ? SHRINK_FACTOR
                     : 1,
                  y: animationsState.hasShineAnimationComplete ? cardOffset : 0,
               }}
               transition={{ duration: 0.5 }}
               sx={[
                  nextModuleStyles.completedModuleCard,
                  animationsState.hasShineAnimationComplete &&
                     nextModuleStyles.slideUp,
               ]}
               onLayoutAnimationComplete={() => {
                  setAnimationsState((prev) => ({
                     ...prev,
                     hasCompletedModuleCardSlidUp: true,
                  }))
               }}
            >
               <ModuleCard
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
                  animate: animationsState.hasCompletedModuleCardSlidUp && {
                     opacity: 1,
                  },
               }}
               animate={"animate"}
               initial={"initial"}
               display="flex"
               flexDirection="column"
               alignItems="center"
               onLayoutAnimationComplete={() => {
                  setAnimationsState((prev) => ({
                     ...prev,
                     hasNextModuleCardAppeared: true,
                  }))
               }}
            >
               <FramerBox
                  key="divider"
                  ref={dividerRef}
                  variants={dividerVariants}
                  animate={
                     animationsState.hasCompletedModuleCardSlidUp
                        ? "animate"
                        : "initial"
                  }
                  sx={nextModuleStyles.divider}
                  layout
                  onAnimationComplete={() => {
                     setAnimationsState((prev) => ({
                        ...prev,
                        hasDividerAnimationComplete: true,
                     }))
                  }}
               />
               <ModuleCard
                  isRecommended={animationsState.hasDividerAnimationComplete}
                  module={nextModule}
               />
            </FramerBox>
         </AnimatePresence>
         <FramerBox
            key="bottom-content"
            sx={[
               nextModuleStyles.bottomContent,
               isShortScreen && {
                  paddingTop: 4,
               },
            ]}
            variants={childVariants}
         >
            <BottomContent nextModule={nextModule} />
         </FramerBox>
      </FramerBox>
   )
}

type BottomContentProps = {
   nextModule: Page<TalentGuideModule>
}

const BottomContent = ({ nextModule }: BottomContentProps) => {
   const { push } = useRouter()

   return (
      <Fragment>
         <Typography
            variant="desktopBrandedH3"
            sx={nextModuleStyles.bottomTitle}
            component="h3"
         >
            Ready for More?
         </Typography>
         <Typography
            variant="medium"
            sx={nextModuleStyles.bottomText}
            component="p"
         >
            Fantastic work on clearing this level! Click below to continue your
            learning journey and tackle the next challenge.
         </Typography>
         <Button
            color="primary"
            variant="contained"
            size="large"
            startIcon={<Play />}
            fullWidth
            sx={nextModuleStyles.bottomButton}
            onClick={() => {
               push(`/talent-guide/${nextModule.slug}`)
            }}
         >
            Start next level
         </Button>
      </Fragment>
   )
}

const containerVariants: Variants = {
   initial: {
      opacity: 0,
      y: 20,
   },
   animate: {
      opacity: 1,
      y: 0,
      transition: {
         duration: 0.5,
         ease: "easeOut",
         staggerChildren: 0.1,
      },
   },
   exit: {
      opacity: 0,
      transition: { duration: 0.3, ease: "easeIn" },
   },
}

const childVariants: Variants = {
   initial: {
      opacity: 0,
      y: 20,
   },
   animate: {
      opacity: 1,
      y: 0,
      transition: {
         duration: 0.5,
         ease: "easeOut",
      },
   },
}
