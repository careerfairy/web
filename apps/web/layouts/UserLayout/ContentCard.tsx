import React, { FC } from "react"
import Paper from "@mui/material/Paper"
import { SxProps } from "@mui/material"
import { DefaultTheme } from "@mui/styles/defaultTheme"
import { IColors, StylesProps, combineStyles } from "../../types/commonTypes"

interface ContentCardProps {
   sx?: SxProps<DefaultTheme>
   bgColor?: IColors
   children: React.ReactNode
}

const styles: StylesProps = {
   root: {
      p: 2,
      transition: (theme) => theme.transitions.create(["box-shadow"]),
   },
}

const ContentCard: FC<ContentCardProps> = ({ sx, children, bgColor }) => {
   return (
      <Paper
         elevation={0}
         sx={combineStyles(
            styles.root,
            sx,
            bgColor
               ? { backgroundColor: bgColor }
               : { backgroundColor: "inherit" }
         )}
      >
         {children}
      </Paper>
   )
}

export default ContentCard
