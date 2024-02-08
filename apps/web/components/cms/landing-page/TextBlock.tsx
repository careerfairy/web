import { HygraphResponseTextBlock } from "../../../types/cmsTypes"
import { Box } from "@mui/material"
import ThemedRichTextRenderer from "../ThemedRichTextRenderer"
import { sxStyles } from "../../../types/commonTypes"

const styles = sxStyles({
   title: {
      textAlign: "center",
      mb: 4,
      "& :first-of-type": {
         fontWeight: 500,
      },
   },
   content: {
      marginX: {
         xs: 4,
         md: 10,
         lg: 36,
         xl: 62,
      },
      textAlign: "center",
   },
})

const TextBlock = ({ textBlockTitle, content }: HygraphResponseTextBlock) => {
   return (
      <Box py={10}>
         <Box sx={styles.title}>
            <ThemedRichTextRenderer rawContent={textBlockTitle.raw} />
         </Box>
         {content ? (
            <Box sx={styles.content}>
               <ThemedRichTextRenderer rawContent={content.raw} />
            </Box>
         ) : null}
      </Box>
   )
}

export default TextBlock
