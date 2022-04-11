import React from "react"
import Section from "./Section"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import Fade from "@stahl.luke/react-reveal/Fade"

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
      backgroundColor: "background.default",
   },
   content: {
      whiteSpace: "pre-line",
   },
}
const About = ({ content, companyName }: Props) => {
   return (
      <Section verticalSpacing={3} disableBottomPadding>
         <Fade bottom>
            <Paper sx={styles.wrapper} elevation={0}>
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
         </Fade>
      </Section>
   )
}

export default About
