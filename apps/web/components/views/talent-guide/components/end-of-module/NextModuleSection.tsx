import { Button, Typography } from "@mui/material"
import FramerBox from "components/views/common/FramerBox"
import { Page, TalentGuideModule } from "data/hygraph/types"
import { AnimatePresence, Variants } from "framer-motion"
import { useRouter } from "next/router"
import { Fragment } from "react"
import { Play } from "react-feather"
import { useModuleData } from "store/selectors/talentGuideSelectors"
import { ModuleCard } from "../module-card/ModuleCard"
import { nextModuleStyles } from "./styles"

type Props = {
   nextModule: Page<TalentGuideModule> | null
}

export const NextModuleSection = ({ nextModule }: Props) => {
   const moduleData = useModuleData()

   return (
      <AnimatePresence>
         <FramerBox
            animate={"animate"}
            initial="initial"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeOut" }}
            variants={containerVariants}
            sx={nextModuleStyles.section}
            data-testid="next-module-section"
         >
            <FramerBox variants={childVariants}>
               <ModuleCard interactive module={nextModule} />
            </FramerBox>
            <FramerBox variants={childVariants}>
               <ModuleCard module={moduleData} />
            </FramerBox>
            <FramerBox
               sx={nextModuleStyles.bottomContent}
               variants={childVariants}
            >
               <BottomContent nextModule={nextModule} />
            </FramerBox>
         </FramerBox>
      </AnimatePresence>
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
