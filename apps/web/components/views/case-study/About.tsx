import React from "react"
import Section from "./Section"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"

interface Props {
   content: string
   companyName: string
}
const styles = {
   root: {},
   wrapper: {
      p: 2,
      borderRadius: 3,
      width: "fit-content",
   },
   content: {
      whiteSpace: "pre-line",
   },
}
const About = ({ content, companyName }: Props) => {
   return (
      <Section verticalSpacing={3} disableBottomPadding>
         <Paper sx={styles.wrapper} variant={"outlined"}>
            <Typography
               color={"text.secondary"}
               gutterBottom
               variant={"h4"}
               component={"h4"}
            >
               About {companyName}
            </Typography>
            <Typography sx={styles.content}>{content}</Typography>
         </Paper>
      </Section>
   )
}

export default About
