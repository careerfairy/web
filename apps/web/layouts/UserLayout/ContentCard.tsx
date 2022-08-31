import React, { FC } from "react"
import Paper from "@mui/material/Paper"
import { SxProps } from "@mui/material"
import { DefaultTheme } from "@mui/styles/defaultTheme"
import { StylesProps } from "../../types/commonTypes"

interface ContentCardProps {
   sx?: SxProps<DefaultTheme>
}

const styles: StylesProps = {
   root: {
      p: 2,
      transition: (theme) => theme.transitions.create(["box-shadow"]),
   },
}

const ContentCard: FC<ContentCardProps> = ({ sx, children }) => {
   return (
      <Paper
         elevation={0}
         sx={[styles.root, ...(Array.isArray(sx) ? sx : [sx])]}
      >
         {children}
      </Paper>
   )
}

export default ContentCard
