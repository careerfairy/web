import { SerializedMarkdown } from "../../../types/cmsTypes"
import ThemedMDXRemote from "../ThemedMDXRemote"
import {
   Accordion,
   AccordionDetails,
   AccordionSummary,
   Typography,
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Link from "../../views/common/Link"

type Props = {
   title: string
   content: SerializedMarkdown
   slug: string
}
const FAQCard = ({ content, title, slug }: Props) => {
   return (
      <Accordion defaultExpanded variant="outlined">
         <Link noLinkStyle href={`#${slug}`}>
            <AccordionSummary
               expandIcon={<ExpandMoreIcon />}
               aria-controls="faq-content"
               id={slug}
            >
               <Typography>{title}</Typography>
            </AccordionSummary>
         </Link>
         <AccordionDetails>
            <Typography>
               <ThemedMDXRemote {...content.mdx} />
            </Typography>
         </AccordionDetails>
      </Accordion>
   )
}
export default FAQCard
