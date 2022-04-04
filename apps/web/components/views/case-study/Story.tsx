import React from "react"
import Section from "./Section"
import { EmbedReferences, RichTextContent } from "@graphcms/rich-text-types"
import Grid from "@mui/material/Grid"
import ThemedRichTextRenderer from "../../cms/ThemedRichTextRenderer"
import Typography from "@mui/material/Typography"

interface Props {
   rawContent: RichTextContent
   references: EmbedReferences
}

const Story = ({ rawContent, references }: Props) => {
   return (
      <Section verticalSpacing={5}>
         <Grid container spacing={2}>
            <Grid item>
               <Typography
                  color={"text.secondary"}
                  gutterBottom
                  variant={"h4"}
                  component={"h4"}
               >
                  The story
               </Typography>
               <ThemedRichTextRenderer
                  references={references}
                  rawContent={rawContent}
               />
            </Grid>
         </Grid>
      </Section>
   )
}

export default Story
