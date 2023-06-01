import { FC } from "react"
import BaseDialogView, { HeroContent, MainContent } from "../../BaseDialogView"
import Stack from "@mui/material/Stack"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { Skeleton } from "@mui/material"
import { QuestionsSkeleton } from "../livestream-details/main-content/Questions"
import Paper from "@mui/material/Paper"

const RegisterAskQuestionsViewSkeleton: FC = () => {
   return (
      <BaseDialogView
         heroContent={
            <HeroContent
               onBackPosition={"top-left"}
               onBackClick={() => {}}
               noMinHeight
            >
               <Stack alignItems="center" spacing={1.75} pb={2}>
                  <Box
                     component={Skeleton}
                     borderRadius={2}
                     variant={"rectangular"}
                     width={58}
                     height={58}
                  />
                  <Box
                     component={Typography}
                     display="flex"
                     flexDirection="column"
                     justifyContent="center"
                     variant="h2"
                     maxWidth={655}
                     width="100%"
                  >
                     <Skeleton width="100%" />
                     <Box component={Skeleton} mx="auto" width="40%" />
                  </Box>
               </Stack>
            </HeroContent>
         }
         mainContent={
            <MainContent>
               <Stack mt={-8} spacing={2} width="100%">
                  <Box
                     width="100%"
                     borderRadius={2}
                     component={Paper}
                     height={140}
                     display="flex"
                     flexDirection="column"
                     justifyContent="end"
                     boxShadow="0px 6px 20px rgba(0, 0, 0, 0.04)"
                     border="1px solid #DCDCDC"
                  />
                  <QuestionsSkeleton />
               </Stack>
            </MainContent>
         }
         fixedBottomContent={<Skeleton variant="rectangular" height={56} />}
      />
   )
}

export default RegisterAskQuestionsViewSkeleton
