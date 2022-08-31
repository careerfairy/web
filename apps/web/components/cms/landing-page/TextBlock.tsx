import { HygraphResponseTextBlock } from "../../../types/cmsTypes"
import { Box } from "@mui/material"
import ThemedRichTextRenderer from "../ThemedRichTextRenderer"

const TextBlock = ({ textBlockTitle, content }: HygraphResponseTextBlock) => {
   return (
      <Box py={6}>
         <Box textAlign="center" mb={4}>
            <ThemedRichTextRenderer rawContent={textBlockTitle.raw} />
         </Box>
         {content && (
            <Box marginX={{ xs: 4, md: 10, lg: 36, xl: 62 }} textAlign="center">
               <ThemedRichTextRenderer rawContent={content.raw} />
            </Box>
         )}
      </Box>
   )
}

export default TextBlock
