import { Button, Typography } from "@mui/material"
import FramerBox from "components/views/common/FramerBox"
import { Page, TalentGuideModule } from "data/hygraph/types"
import { Variants } from "framer-motion"
import { useRouter } from "next/router"
import { Play } from "react-feather"
import { nextModuleStyles } from "./styles"

type Props = {
   nextModule: Page<TalentGuideModule>
}

export const NextModuleSection = ({ nextModule }: Props) => {
   // const moduleData = useModuleData()

   return (
      <FramerBox
         animate={"animate"}
         initial="initial"
         exit="exit"
         transition={{ duration: 0.5, ease: "easeOut" }}
         variants={feedbackVariants}
         sx={nextModuleStyles.section}
      >
         <BottomContent nextModule={nextModule} />
      </FramerBox>
   )
}

type BottomContentProps = {
   nextModule: Page<TalentGuideModule>
}

const BottomContent = ({ nextModule }: BottomContentProps) => {
   const { push } = useRouter()

   return (
      <FramerBox sx={nextModuleStyles.bottomContent}>
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
      </FramerBox>
   )
}

const feedbackVariants: Variants = {
   initial: {
      opacity: 0,
      bottom: 0,
      y: 20,
   },
   animate: {
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
      bottom: 0,
      y: 0,
   },
   exit: {
      opacity: 0,
      transition: { duration: 0.3, ease: "easeIn" },
   },
}
