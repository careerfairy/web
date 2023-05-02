import React, { FC } from "react"
import { Box, Typography } from "@mui/material"
import Stack from "@mui/material/Stack"
import Image from "next/image"
import { sxStyles } from "../../../../types/commonTypes"

const styles = sxStyles({
   info: {
      marginTop: 4,
      display: "flex",
      flexDirection: "column",
   },
   logoWrapper: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 88,
      height: 48,
      p: [1, 1.5],
      backgroundColor: "white",
      borderRadius: 1.5,
   },
   headerTitle: {
      fontWeight: "bold",
      color: "white",
   },
   title: {
      fontWeight: "bold",
      color: "white",
      maxWidth: {
         xs: "100%",
         md: "80%",
         lg: "60%",
      },
      whiteSpace: "pre-line",
   },
   subtitle: {
      fontWeight: "400",
      color: "white",
      mt: 1,
   },
})

type ContentProps = {
   headerTitle: string | React.ReactNode
   logoUrl?: string
   title?: string | React.ReactNode
   subtitle: string | React.ReactNode
   actionItem?: React.ReactNode
}

const Content: FC<ContentProps> = ({
   actionItem,
   headerTitle,
   logoUrl,
   subtitle,
   title,
}) => {
   return (
      <Box sx={styles.info}>
         <Stack spacing={1.5} mt={4}>
            <Typography
               variant={"h2"}
               component="h1"
               gutterBottom
               sx={styles.headerTitle}
            >
               {headerTitle}
            </Typography>
            {logoUrl ? (
               <Box sx={styles.logoWrapper} mt={2}>
                  <Image
                     objectFit="contain"
                     quality={90}
                     src={logoUrl}
                     alt={"company logo"}
                     width={200}
                     height={100}
                  />
               </Box>
            ) : null}
            <Typography
               variant={
                  typeof title === "string" && title.length > 95 ? "h5" : "h4"
               }
               component="h2"
               sx={styles.title}
            >
               {title}
            </Typography>
            <Typography variant={"h6"} component="h2" sx={styles.subtitle}>
               {subtitle}
            </Typography>
         </Stack>
         {actionItem ? <Box mt={2}>{actionItem}</Box> : null}
      </Box>
   )
}

export default Content
