import React from "react"
import Section from "../../Section"
import { Container } from "@mui/material"
import StreamsTab from "../StreamsTab"

const styles = {
   container: {
      zIndex: 1,
      "&.MuiContainer-root": {
         position: "relative",
      },
   },
   section: {
      p: [0, "!important"],
   },
   defaultTitle: {
      fontSize: "1.8rem",
      letterSpacing: "8px",
   },
}
type Props = {
   color: string
   handleChange: (event, newValue) => void
   value: string
}

const NextLivestreamsBannerSection = ({
   color,
   handleChange,
   value,
}: Props) => {
   return (
      <Section sx={styles.section} color={color}>
         <Container sx={styles.container}>
            <StreamsTab
               handleChange={handleChange}
               value={value}
               hasFilter={true}
               hideTabs={true}
            />
         </Container>
      </Section>
   )
}

export default NextLivestreamsBannerSection
