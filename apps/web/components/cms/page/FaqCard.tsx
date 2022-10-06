import {
   Accordion,
   AccordionDetails,
   AccordionSummary,
   Typography,
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Link from "../../views/common/Link"
import { RichTextContent } from "@graphcms/rich-text-types"
import ThemedRichTextRenderer from "../ThemedRichTextRenderer"
import React from "react"

type Props = {
   title: string
   content: {
      raw: RichTextContent
   }
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
               <ThemedRichTextRenderer rawContent={content.raw} />
            </Typography>
         </AccordionDetails>
      </Accordion>
   )
}
export default FAQCard
