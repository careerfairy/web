import { Stack, Typography } from "@mui/material"
import React, { FC } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      color: "#2C2C2C",
      fontSize: "24px",
      fontWeight: 600,
      mb: "12px",
   },
   description: {
      fontSize: "16px",
      color: "#5F5F5F",
   },
})

type Props = {
   title: string
   description: string
}

const LeftColumn: FC<Props> = ({ title, description }) => {
   return (
      <Stack>
         <Typography sx={styles.root}>{title}</Typography>
         <Typography sx={styles.description}>{description}</Typography>
      </Stack>
   )
}
export default LeftColumn
