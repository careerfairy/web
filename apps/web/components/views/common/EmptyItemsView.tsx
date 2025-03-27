import { Box, Stack, Typography } from "@mui/material"
import { ReactNode } from "react"
import { Briefcase } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      p: "20px",
      backgroundColor: (theme) => theme.brand.white[300],
      border: (theme) => `1px solid ${theme.brand.white[400]}`,
      borderRadius: "8px",
   },
   title: {
      fontSize: "16px",
      fontWeight: 600,
   },
   description: {
      fontSize: "14px",
      fontWeight: 400,
      textAlign: "center",
   },
})

type Props = {
   title: string
   description: string
   icon?: ReactNode
   children?: ReactNode
}

export const EmptyItemsView = ({
   title,
   description,
   icon,
   children,
}: Props) => {
   return (
      <Box
         sx={styles.root}
         display={"flex"}
         flexDirection="column"
         alignItems={"center"}
         justifyContent={"center"}
      >
         <Stack alignItems={"center"}>
            <Box color={"primary.main"} mb={1.5}>
               {icon ?? <Briefcase width={"44px"} height={"44px"} />}
            </Box>
            <Typography sx={styles.title} color="neutral.800">
               {title}
            </Typography>
            <Typography sx={styles.description} color={"neutral.600"}>
               {description}
            </Typography>
         </Stack>
         {children}
      </Box>
   )
}
