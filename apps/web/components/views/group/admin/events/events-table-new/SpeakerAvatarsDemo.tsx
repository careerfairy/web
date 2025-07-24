import { Speaker } from "@careerfairy/shared-lib/livestreams/livestreams"
import { Box, Stack, Typography } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { SpeakerAvatars } from "./SpeakerAvatars"

const styles = sxStyles({
   demoContainer: {
      p: 3,
      backgroundColor: "background.paper",
      borderRadius: 2,
      border: "1px solid",
      borderColor: "neutral.200",
   },
   demoSection: {
      mb: 3,
      p: 2,
      backgroundColor: "neutral.50",
      borderRadius: 1,
   },
})

// Mock speaker data for demo
const mockSpeakers: Speaker[] = [
   {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      position: "Senior Software Engineer",
      avatar: "https://i.pravatar.cc/150?img=1",
      roles: [],
   },
   {
      id: "2",
      firstName: "Jane",
      lastName: "Smith",
      position: "Product Manager",
      avatar: "https://i.pravatar.cc/150?img=2",
      roles: [],
   },
   {
      id: "3",
      firstName: "Mike",
      lastName: "Johnson",
      position: "UI/UX Designer",
      avatar: "https://i.pravatar.cc/150?img=3",
      roles: [],
   },
   {
      id: "4",
      firstName: "Sarah",
      lastName: "Wilson",
      position: "Data Scientist",
      avatar: "https://i.pravatar.cc/150?img=4",
      roles: [],
   },
   {
      id: "5",
      firstName: "David",
      lastName: "Brown",
      position: "DevOps Engineer",
      avatar: "https://i.pravatar.cc/150?img=5",
      roles: [],
   },
   {
      id: "6",
      firstName: "Emily",
      lastName: "Davis",
      position: "Marketing Director",
      avatar: "",
      roles: [],
   },
]

export const SpeakerAvatarsDemo = () => {
   return (
      <Box sx={styles.demoContainer}>
         <Typography variant="brandedH3" sx={{ mb: 3 }}>
            Speaker Avatars Component Demo
         </Typography>

         <Stack spacing={3}>
            <Box sx={styles.demoSection}>
               <Typography variant="medium" sx={{ mb: 2, fontWeight: 600 }}>
                  1 Speaker
               </Typography>
               <SpeakerAvatars speakers={mockSpeakers.slice(0, 1)} />
            </Box>

            <Box sx={styles.demoSection}>
               <Typography variant="medium" sx={{ mb: 2, fontWeight: 600 }}>
                  2 Speakers
               </Typography>
               <SpeakerAvatars speakers={mockSpeakers.slice(0, 2)} />
            </Box>

            <Box sx={styles.demoSection}>
               <Typography variant="medium" sx={{ mb: 2, fontWeight: 600 }}>
                  3 Speakers
               </Typography>
               <SpeakerAvatars speakers={mockSpeakers.slice(0, 3)} />
            </Box>

            <Box sx={styles.demoSection}>
               <Typography variant="medium" sx={{ mb: 2, fontWeight: 600 }}>
                  4 Speakers
               </Typography>
               <SpeakerAvatars speakers={mockSpeakers.slice(0, 4)} />
            </Box>

            <Box sx={styles.demoSection}>
               <Typography variant="medium" sx={{ mb: 2, fontWeight: 600 }}>
                  5+ Speakers
               </Typography>
               <SpeakerAvatars speakers={mockSpeakers} />
            </Box>

            <Box sx={styles.demoSection}>
               <Typography variant="medium" sx={{ mb: 2, fontWeight: 600 }}>
                  Without Tooltip
               </Typography>
               <SpeakerAvatars
                  speakers={mockSpeakers.slice(0, 3)}
                  showTooltip={false}
               />
            </Box>

            <Box sx={styles.demoSection}>
               <Typography variant="medium" sx={{ mb: 2, fontWeight: 600 }}>
                  Custom Max Visible (2)
               </Typography>
               <SpeakerAvatars speakers={mockSpeakers} maxVisible={2} />
            </Box>
         </Stack>
      </Box>
   )
}
