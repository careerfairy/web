import React from "react"
import Section from "./Section"
import { EmbedReferences, RichTextContent } from "@graphcms/rich-text-types"
import Grid from "@mui/material/Grid"
import ThemedRichTextRenderer from "../../cms/ThemedRichTextRenderer"
import Fade from "@stahl.luke/react-reveal/Fade"
import SectionTitle from "./SectionTitle"
import { StatisticStat } from "../../../types/cmsTypes"
import MuiGridFade from "../../../materialUI/animations/MuiGridFade"

import Stack from "@mui/material/Stack"
import StatItem from "./StatItem"

const styles = {
   stack: {
      ml: "40px",
   },
}
interface Props {
   rawContent: RichTextContent
   references: EmbedReferences
   stats: StatisticStat[]
}

const Statistics = ({ rawContent, references, stats }: Props) => {
   const hasStats = Boolean(stats.length)
   return (
      <Section verticalSpacing={5}>
         <Fade bottom>
            <SectionTitle title={"How it turned out"} />
         </Fade>
         <Grid container spacing={2}>
            <Grid xs={12} item>
               <Fade bottom>
                  <ThemedRichTextRenderer
                     references={references}
                     rawContent={rawContent}
                  />
               </Fade>
            </Grid>
            {hasStats && (
               <Grid xs={12} item>
                  <Stack
                     justifyContent={"center"}
                     sx={styles.stack}
                     spacing={2}
                  >
                     {stats.map((stat, index) => (
                        <MuiGridFade key={stat.id} right index={index}>
                           <StatItem stat={stat} />
                        </MuiGridFade>
                     ))}
                  </Stack>
               </Grid>
            )}
         </Grid>
      </Section>
   )
}

export default Statistics
