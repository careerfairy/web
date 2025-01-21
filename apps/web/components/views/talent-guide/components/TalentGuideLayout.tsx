import { Box, Container, ContainerProps } from "@mui/material"
import { ReactNode } from "react"
import { sxStyles } from "types/commonTypes"
import {
   HeaderHeightContext,
   useMeasureHeaderHeight,
} from "../context/HeaderHeightContext"

const styles = sxStyles({
   root: (theme) => ({
      minHeight: "100dvh",
      position: "relative",
      bgcolor: theme.brand.white[300],
   }),
   header: (theme) => ({
      width: "100%",
      position: "sticky",
      top: 0,
      bgcolor: theme.brand.white[200],
      borderBottom: "1px solid",
      borderColor: theme.brand.white[500],
      zIndex: 5,
   }),
})

type Props = {
   children: ReactNode
   header?: ReactNode
} & Omit<ContainerProps, "maxWidth">

export const TalentGuideLayout = ({
   children,
   header,
   ...containerProps
}: Props) => {
   const { height, ref } = useMeasureHeaderHeight()

   return (
      <HeaderHeightContext.Provider value={height}>
         <Box id="talent-guide-layout" component="main" sx={styles.root}>
            {Boolean(header) && (
               <Box ref={ref} sx={styles.header}>
                  {header}
               </Box>
            )}
            <Container
               maxWidth={false}
               disableGutters
               id="talent-guide-container"
               {...containerProps}
            >
               {children}
            </Container>
         </Box>
      </HeaderHeightContext.Provider>
   )
}
