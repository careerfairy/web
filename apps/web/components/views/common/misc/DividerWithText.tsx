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
   content: {
      paddingTop: 1,
      paddingBottom: 1,
      paddingRight: 2,
      paddingLeft: 2,
      color: "#DCDCDC",
      fontSize: "1.14286rem",
      fontWeight: 400,
      letterSpacing: "-0.03121rem",
   },
})

type Props = {
   maxWidth?: BoxProps["maxWidth"]
   children: React.ReactNode
}

const DividerWithText: FC<Props> = ({ children, maxWidth }) => {
   return (
      <Box maxWidth={maxWidth} sx={styles.container}>
         <Box sx={styles.border} />
         <Box component="span" sx={styles.content}>
            {children}
         </Box>
         <Box sx={styles.border} />
      </Box>
   )
}

export default DividerWithText
