import { Typography } from "@mui/material"
import FramerBox from "components/views/common/FramerBox"
import { Page, TalentGuideModule } from "data/hygraph/types"
import { Variants } from "framer-motion"
import { useModuleData } from "store/selectors/talentGuideSelectors"

type Props = {
   nextModule: Page<TalentGuideModule>
}

export const NextModuleSection = ({ nextModule }: Props) => {
   const moduleData = useModuleData()
   console.log(
      "🚀 ~ file: NextModuleSection.tsx:13 ~ NextModuleSection ~ moduleData:",
      moduleData
   )

   return (
      <FramerBox
         animate={"animate"}
         initial="initial"
         exit="exit"
         transition={{ duration: 0.5, ease: "easeOut" }}
         variants={feedbackVariants}
      >
         <Typography variant="h2">Next Module</Typography>
         <Typography variant="body1">
            {nextModule.content.moduleName}
         </Typography>
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
      transform: "translateY(0px)",
   },
}
