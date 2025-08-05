import { Stack, StackProps } from "@mui/material"
import { BrandedTooltip } from "components/views/streaming-page/components/BrandedTooltip"
import { ReactNode } from "react"
import { sxStyles } from "types/commonTypes"

type TableHighlighterProps = StackProps & {
   title?: string
   children: ReactNode
   cursor?: string
}

const styles = sxStyles({
   container: {
      borderRadius: "8px",
      transition: (theme) =>
         theme.transitions.create(["background-color", "box-shadow"], {
            duration: theme.transitions.duration.short,
         }),
      background: "transparent",
      p: 1,
      "&:hover": {
         backgroundColor: "neutral.50",
      },
      "&:active": {
         backgroundColor: "neutral.100",
      },
      "&:focus": {
         outline: "none",
         boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}`,
      },
      "&.Mui-disabled": {
         cursor: "not-allowed",
         opacity: 0.5,
         "&:hover": {
            backgroundColor: "transparent",
         },
      },
   },
})

export const TableHighlighter = ({
   title,
   children,
   cursor = "pointer",
   ...stackProps
}: TableHighlighterProps) => {
   const content = (
      <Stack sx={[styles.container, { cursor }]} {...stackProps}>
         {children}
      </Stack>
   )

   if (title) {
      return (
         <BrandedTooltip
            placement="top"
            title={title}
            disableInteractive
            offset={[0, -10]}
         >
            {content}
         </BrandedTooltip>
      )
   }

   return content
}
