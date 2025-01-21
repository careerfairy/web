import { Button, Typography, useMediaQuery } from "@mui/material"
import useTraceUpdate from "components/custom-hook/utils/useTraceUpdate"
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

type Props = {
   nextModule: Page<TalentGuideModule> | null
}

const SHRINK_FACTOR = 0.7

type AnimationsState = {
   hasShineAnimationComplete: boolean
   hasDividerAnimationComplete: boolean
   hasCompletedModuleCardSlidUp: boolean
   hasNextModuleCardAppeared: boolean
}

export const NextModuleSection = ({ nextModule }: Props) => {
   const [animationsState, setAnimationsState] = useState<AnimationsState>({
      hasShineAnimationComplete: false,
      hasCompletedModuleCardSlidUp: false,
      hasDividerAnimationComplete: false,
      hasNextModuleCardAppeared: false,
   })

   useTraceUpdate(animationsState)

   const moduleData = useModuleData()

   const [cardOffset, setCardOffset] = useState(0)
   console.log(
      "🚀 ~ file: NextModuleSection.tsx:44 ~ NextModuleSection ~ cardOffset:",
      cardOffset
   )

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
      console.log("🚀", {
         completedCardRef: completedCardRef.current,
         dividerRef: dividerRef.current,
         hasShineAnimationComplete: animationsState.hasShineAnimationComplete,
      })
      if (
         completedCardRef.current &&
         dividerRef.current &&
         animationsState.hasShineAnimationComplete
      ) {
         const cardHeight =
            completedCardRef.current.getBoundingClientRect().height
         console.log("🚀 ~ cardHeight:", cardHeight)

         const scaledHeight = cardHeight * SHRINK_FACTOR
         console.log("🚀 ~ scaledHeight:", scaledHeight)

         const offset = (cardHeight - scaledHeight) / 2
         console.log("🚀 ~ offset:", offset)

         setCardOffset(offset)
      }
   }, [animationsState.hasShineAnimationComplete])

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
               sx={
                  isShortScreen
                     ? {
                          paddingBottom:
                             animationsState.hasNextModuleCardAppeared ? 5 : 10,
                       }
                     : null
               }
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
               <ModuleCard
                  isRecommended={animationsState.hasDividerAnimationComplete}
                  module={nextModule}
               />
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
            component={Link}
            noLinkStyle
            href={nextModule ? `/levels/${nextModule.slug}` : "/levels"}
            sx={nextModuleStyles.bottomButton}
         >
            Start next level
         </Button>
      </Fragment>
   )
}
