import React from "react"
import Typography from "@mui/material/Typography"

interface Props {
   title: string
}
const styles = {
   root: {
      overflow: "hidden",
      textAlign: "center",
      mb: 3,
      "&:before,&:after": {
         backgroundColor: "#000",
         content: '""',
         display: "inline-block",
         height: "1px",
         position: "relative",
         verticalAlign: "middle",
         width: "50%",
      },
      "&:before": { right: "0.5em", marginLeft: "-50%" },
      "&:after": { left: "0.5em", marginRight: "-50%" },
   },
}
const SectionTitle = ({ title }: Props) => {
   return (
      <Typography
         color={"text.secondary"}
         gutterBottom
         variant={"h4"}
         sx={styles.root}
         component={"h4"}
      >
         {title}
      </Typography>
   )
}

export default SectionTitle
