import { EventRatingAnswer } from "@careerfairy/shared-lib/livestreams"
import { Box, Button, Stack, Typography } from "@mui/material"
import UserAvatar from "components/views/common/UserAvatar"
import { useState } from "react"
import { ChevronDown } from "react-feather"
import { sxStyles } from "../../../../../../../types/commonTypes"

const styles = sxStyles({
   container: {
      minHeight: 200,
      overflowY: "auto",
      width: "100%",
      "&::-webkit-scrollbar": {
         display: "none",
      },
      scrollbarWidth: "none",
   },
   answerCard: {
      p: 2,
      borderRadius: "8px",
      border: 1,
      borderColor: (theme) => theme.brand.white[500],
      backgroundColor: (theme) => theme.brand.white[200],
      display: "flex",
      flexDirection: "row",
      gap: 1,
      alignItems: "flex-start",
   },
   loadMoreButton: {
      borderRadius: "20px",
      border: 1,
      borderColor: "neutral.200",
      color: "neutral.600",
      textTransform: "none",
      px: 3,
      py: 1,
      width: "100%",
      justifyContent: "center",
      gap: 1,
      "&:hover": {
         backgroundColor: "neutral.50",
         borderColor: "neutral.300",
      },
   },
})

type WrittenViewProps = {
   voters: EventRatingAnswer[]
}

const INITIAL_VISIBLE_COUNT = 3

export const WrittenView = ({ voters }: WrittenViewProps) => {
   const [showAll, setShowAll] = useState(false)
   const hasMore = voters.length > INITIAL_VISIBLE_COUNT && !showAll

   const handleLoadMore = () => {
      setShowAll(true)
   }

   const visibleVoters = showAll
      ? voters
      : voters.slice(0, INITIAL_VISIBLE_COUNT)

   return (
      <Stack spacing={2}>
         <Typography variant="small" color="neutral.800">
            {voters.length} answers
         </Typography>
         <Stack spacing={1.5} width="100%">
            <Stack spacing={1.5} sx={styles.container}>
               {visibleVoters.map((answer) => (
                  <Box key={answer.id} sx={styles.answerCard}>
                     <UserAvatar
                        size={28}
                        data={{
                           authId: answer.user?.id,
                           firstName: answer.user?.firstName,
                           lastName: answer.user?.lastName,
                           avatar: answer.user?.avatarUrl,
                        }}
                     />
                     <Typography variant="medium" color="neutral.700">
                        {answer.message}
                     </Typography>
                  </Box>
               ))}
            </Stack>
            {hasMore ? (
               <Button
                  variant="text"
                  sx={styles.loadMoreButton}
                  onClick={handleLoadMore}
               >
                  <Typography variant="medium" color="inherit">
                     Load more answers
                  </Typography>
                  <ChevronDown size={18} />
               </Button>
            ) : null}
         </Stack>
      </Stack>
   )
}
