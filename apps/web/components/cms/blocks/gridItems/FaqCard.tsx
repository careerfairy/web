import { SerializedMarkdown } from "../../../../types/cmsTypes"
import ThemedMDXRemote from "../../ThemedMDXRemote"
import {
   Accordion,
   AccordionDetails,
   AccordionSummary,
   Typography,
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"

type Props = {
   title: string
   content: SerializedMarkdown
   slug: string
}
const FAQCard = ({ content, title, slug, ...rest }: Props) => {
   return (
      <Accordion variant="outlined">
         <a href={`#${slug}`}>
            <AccordionSummary
               expandIcon={<ExpandMoreIcon />}
               aria-controls="panel1a-content"
               id="panel1a-header"
            >
               <Typography>{title}</Typography>
            </AccordionSummary>
         </a>
         <AccordionDetails>
            <Typography>
               <ThemedMDXRemote {...content.mdx} />
            </Typography>
         </AccordionDetails>
      </Accordion>
   )
}
export default FAQCard
