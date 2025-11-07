import { sxStyles } from "types/commonTypes"

export const questionCardStyles = sxStyles({
   root: (theme) => ({
      border: (theme) => `1px solid ${theme.brand.white[500]}`,
      backgroundColor: theme.brand.white[100],
      borderRadius: "12px",
      transition: theme.transitions.create("border"),
      overflow: "hidden",
      position: "relative",
   }),
   greenBorder: {
      border: (theme) => `1px solid ${theme.palette.primary.main}`,
   },
   whiteBorder: {
      border: (theme) => `2px solid ${theme.brand.white[500]}`,
   },
   questionHeaderGreen: (theme) => ({
      color: theme.brand.white[100],
      backgroundColor: "primary.main",
   }),
   checkCircle: {
      width: 16,
      height: 16,
   },
   options: {
      position: "absolute",
      top: 11,
      right: 12,
   },
   whiteOptions: {
      "& svg": {
         color: (theme) => theme.brand.white[100],
      },
   },
   title: {
      wordBreak: "break-word",
      whiteSpace: "pre-line",
   },
})

export const commentCardStyles = sxStyles({
   root: (theme) => ({
      borderRadius: "8px",
      border: `1px solid ${theme.brand.black[300]}`,
      backgroundColor: theme.brand.white[200],
      py: 1,
      pl: 1.5,
      pr: 0.5,
   }),
   optionsIcon: {
      "& svg": {
         width: 21,
         height: 21,
         color: (theme) => theme.brand.black[600],
      },
   },
   title: {
      wordBreak: "break-word",
      whiteSpace: "pre-line",
   },
})
