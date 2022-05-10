import React from "react"
import { CircularProgress, Typography } from "@mui/material"
import { Wish } from "@careerfairy/shared-lib/dist/wishes"
import Stack from "@mui/material/Stack"
import Box from "@mui/material/Box"
import WishCard from "./WishCard"
import { useInterests } from "../../custom-hook/useCollection"

interface WishSectionProps {
   wishes: Wish[]
   loading: boolean
   loadingMore: boolean
   loadingError: null | Error
   loadingMoreError: null | Error
}
const WishSection = ({
   wishes,
   loading,
   loadingError,
   loadingMore,
   loadingMoreError,
}: WishSectionProps) => {
   // use interests collection
   const { data: interests } = useInterests()
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
         <Box>
            <Typography variant="h6">Error loading more wishes</Typography>
            <Typography variant="body1">{loadingMoreError.message}</Typography>
         </Box>
      )
   }

   if (loading) {
      return (
         <Box>
            <Typography variant="h6">Loading wishes...</Typography>
         </Box>
      )
   }

   return (
      <Stack spacing={2}>
         <Stack spacing={2}>
            {wishes.map((wish) => (
               <WishCard interests={interests} key={wish.id} wish={wish} />
            ))}
         </Stack>
         {loadingMore && (
            <Box>
               <CircularProgress />
            </Box>
         )}
      </Stack>
   )
}

export default WishSection
