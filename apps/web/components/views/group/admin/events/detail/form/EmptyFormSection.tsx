import { Box, Stack, Typography } from "@mui/material"
import { FC, ReactNode } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   wrap: {
      display: "flex",
      justifyContent: "center",
      width: "100%",
      background: "#F7F8FC",
      borderRadius: (theme) => theme.spacing(1),
      border: "1px solid #EDE7FD",
      py: "32px",
   },
   content: {
      alignItems: "center",
      textAlign: "center",
      maxWidth: "500px",
      mx: 2,
   },
})

type EmptyFormSectionProps = {
   icon: ReactNode
   title: string
   caption: string
}

const EmptyFormSection: FC<EmptyFormSectionProps> = ({
   icon,
   title,
   caption,
}) => {
   return (
      <Box sx={styles.wrap}>
         <Stack spacing={2} sx={styles.content}>
            {icon}
            <Typography variant="brandedH4" fontWeight={"bold"}>
               {title}
            </Typography>
            <Typography variant={"brandedBody"}>{caption}</Typography>
         </Stack>
      </Box>
   )
}

export default EmptyFormSection
