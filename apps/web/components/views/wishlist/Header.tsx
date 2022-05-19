import React from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

interface Props {
   title: string
   subtitle: string
}

const styles = {
   title: {},
   subtitle: {
      maxWidth: 450,
   },
}
const Header = ({ subtitle, title }: Props) => {
   return (
      <Box>
         <Typography sx={styles.title} gutterBottom variant="h2">
            {title}
         </Typography>
         <Typography
            sx={styles.subtitle}
            color={"text.secondary"}
            variant="h5"
            component={"h4"}
         >
            {subtitle}
         </Typography>
      </Box>
   )
}

export default Header
