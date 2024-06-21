import { Box, BoxProps } from "@mui/material"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   container: {
      display: "flex",
      alignItems: "center",
      width: "100%",
   },
   border: {
      borderBottom: "1px solid #DCDCDC",
      width: "100%",
   },
})

type Props = {
   maxWidth?: BoxProps["maxWidth"]
   children: React.ReactNode
   textPadding?: BoxProps["px"]
   verticalPadding?: BoxProps["py"]
}

const DividerWithText: FC<Props> = ({
   children,
   maxWidth,
   textPadding = 2,
   verticalPadding = 1,
}) => {
   return (
      <Box maxWidth={maxWidth} sx={styles.container}>
         <Box sx={styles.border} />
         <Box component="span" px={textPadding} py={verticalPadding}>
            {children}
         </Box>
         <Box sx={styles.border} />
      </Box>
   )
}

export default DividerWithText
