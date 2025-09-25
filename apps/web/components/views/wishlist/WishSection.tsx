import React from "react"
import { CircularProgress, Typography } from "@mui/material"
import { Wish } from "@careerfairy/shared-lib/dist/wishes"
import Stack from "@mui/material/Stack"
import Box from "@mui/material/Box"
import WishCard from "./WishCard"
import { StylesProps } from "../../../types/commonTypes"
import { SearchResponse } from "@algolia/client-search"

interface WishSectionProps {
   wishes: SearchResponse<Wish>["hits"]
   loading: boolean
   loadingMore?: boolean
   loadingError?: null | Error
   loadingMoreError?: null | Error
   empty?: boolean
}
const styles: StylesProps = {
   wrapper: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
   },
   image: {
      width: 150,
      height: 150,
      my: 3,
   },
}
const WishSection = ({
   wishes,
   loading,
   loadingError,
   loadingMore,
   loadingMoreError,
   empty,
}: WishSectionProps) => {
   // use interests collection
   if (loadingError) {
      return (
         <Box>
            <Typography variant="h6">Error loading wishes</Typography>
            <Typography variant="body1">{loadingError.message}</Typography>
         </Box>
      )
   }

   if (loadingMoreError) {
      return (
         <Box sx={styles.wrapper}>
            <Typography variant="h6">Error loading more wishes</Typography>
            <Typography variant="body1">{loadingMoreError.message}</Typography>
         </Box>
      )
   }

   if (loading) {
      return (
         <Box sx={styles.wrapper}>
            <CircularProgress />
         </Box>
      )
   }

   if (empty) {
      return (
         <Box sx={styles.wrapper}>
            <Box
               sx={styles.image}
               component={"img"}
               src={"/empty-search.svg"}
            />
            <Typography color={"text.secondary"} variant="body1">
               No wishes found.
            </Typography>
         </Box>
      )
   }

   return (
      <Stack spacing={2}>
         <Stack spacing={2}>
            {wishes.map((wish) => (
               <WishCard key={wish.id} wish={wish} />
            ))}
         </Stack>
         {Boolean(loadingMore) && (
            <Box>
               <CircularProgress />
            </Box>
         )}
      </Stack>
   )
}

export default WishSection
