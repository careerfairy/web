import React from "react"
import Section from "./Section"
import { EmbedReferences, RichTextContent } from "@graphcms/rich-text-types"
import Grid from "@mui/material/Grid"
import ThemedRichTextRenderer from "../../cms/ThemedRichTextRenderer"
import Fade from "@stahl.luke/react-reveal/Fade"
import SectionTitle from "./SectionTitle"

interface Props {
   rawContent: RichTextContent
   references: EmbedReferences
}

const Story = ({ rawContent, references }: Props) => {
   return (
      <Section verticalSpacing={5}>
         <Grid container spacing={2}>
            <Grid item>
               <Fade bottom>
                  <SectionTitle title={"The Story"} />
               </Fade>
               <Fade bottom>
                  <ThemedRichTextRenderer
                     references={references}
                     rawContent={rawContent}
                  />
               </Fade>
            </Grid>
         </Grid>
      </Section>
   )
}

export default Story
