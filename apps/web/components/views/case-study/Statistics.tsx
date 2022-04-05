import React from "react"
import Section from "./Section"
import { EmbedReferences, RichTextContent } from "@graphcms/rich-text-types"
import Grid from "@mui/material/Grid"
import ThemedRichTextRenderer from "../../cms/ThemedRichTextRenderer"
import Typography from "@mui/material/Typography"
import Fade from "@stahl.luke/react-reveal/Fade"

interface Props {
   rawContent: RichTextContent
   references: EmbedReferences
}

const Statistics = ({ rawContent, references }: Props) => {
   return (
      <Section verticalSpacing={5}>
         <Grid container spacing={2}>
            <Grid item>
               <Fade bottom>
                  <Typography
                     color={"text.secondary"}
                     gutterBottom
                     variant={"h4"}
                     component={"h4"}
                  >
                     How it turned out
                  </Typography>
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

export default Statistics
