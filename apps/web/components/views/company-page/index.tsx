import { Group } from "@careerfairy/shared-lib/groups"
import Header from "./Header"
import {
   createContext,
   useCallback,
   useContext,
   useMemo,
   useState,
} from "react"
import { Box, Container, Grid, Grow, Stack } from "@mui/material"
import AboutSection from "./AboutSection"
import TestimonialsSection from "./TestimonialsSection"
import StreamSection from "./StreamSection"
import MediaSection from "./MediaSection"
import { groupRepo } from "../../../data/RepositoryInstances"

type Props = {
   group: Group
   editMode: boolean
}

export enum TabValue {
   profile = "profile",
   media = "media",
   testimonials = "testimonials",
   livesStreams = "livesStreams",
}

type ICompanyPageContext = {
   group: Group
   tabValue: TabValue
   changeTabValue: (tabValues: TabValue) => void
   editMode: boolean
   changeIsSaving: () => void
}

const CompanyPageContext = createContext<ICompanyPageContext>({
   group: null,
   tabValue: TabValue.profile,
   changeTabValue: () => {},
   editMode: false,
   changeIsSaving: async () => {},
})

const CompanyPageOverview = ({ group, editMode }: Props) => {
   const [tabValue, setTabValue] = useState(TabValue.profile as TabValue)
   const [contextGroup, setContextGroup] = useState(group as Group)

   const handleChangeTabValue = useCallback((tabValue) => {
      setTabValue(tabValue)
   }, [])

   const handleChangeIsSaving = useCallback(async () => {
      // Get updated group information and set it on context group
      const updatedGroup = await groupRepo.getGroupById(group.groupId)
      setContextGroup(updatedGroup)
   }, [group.groupId])

   const contextValue = useMemo(
      () => ({
         group: contextGroup,
         tabValue,
         editMode,
         changeTabValue: handleChangeTabValue,
         changeIsSaving: handleChangeIsSaving,
      }),
      [
         contextGroup,
         editMode,
         handleChangeIsSaving,
         handleChangeTabValue,
         tabValue,
      ]
   )

   return (
      <CompanyPageContext.Provider value={contextValue}>
         <Box height={"100%"}>
            <Box mb={{ xs: 4, md: 10 }}>
               <Header />
            </Box>
            <Grow in>
               <Container maxWidth="lg">
                  <Grid container spacing={4}>
                     <Grid item xs={12} md={6}>
                        <Stack spacing={{ xs: 4, md: 8 }}>
                           <AboutSection />
                           <TestimonialsSection />
                           <StreamSection />
                        </Stack>
                     </Grid>
                     <Grid item xs={12} md={6}>
                        <MediaSection />
                     </Grid>
                  </Grid>
               </Container>
            </Grow>
         </Box>
      </CompanyPageContext.Provider>
   )
}

export const useCompanyPage = () =>
   useContext<ICompanyPageContext>(CompanyPageContext)

export default CompanyPageOverview
