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
import StreamSection from "./StreamSection"
import MediaSection from "./MediaSection"
import TestimonialSection from "./TestimonialSection"
import { useFirestore, useFirestoreDocData } from "reactfire"
import { doc } from "firebase/firestore"
import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"

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
}

const CompanyPageContext = createContext<ICompanyPageContext>({
   group: null,
   tabValue: TabValue.profile,
   changeTabValue: () => {},
   editMode: false,
})

const CompanyPageOverview = ({ group, editMode }: Props) => {
   const [tabValue, setTabValue] = useState(TabValue.profile as TabValue)

   const groupRef = doc(
      useFirestore(),
      "careerCenterData",
      group.id
   ).withConverter(createGenericConverter<Group>())

   const { data: contextGroup } = useFirestoreDocData(groupRef, {
      initialData: group,
   })

   const handleChangeTabValue = useCallback((tabValue) => {
      setTabValue(tabValue)
   }, [])

   const contextValue = useMemo(
      () => ({
         group: contextGroup,
         tabValue,
         editMode,
         changeTabValue: handleChangeTabValue,
      }),
      [contextGroup, editMode, handleChangeTabValue, tabValue]
   )

   return (
      <CompanyPageContext.Provider value={contextValue}>
         <Box sx={{ backgroundColor: "white", height: "100%" }}>
            <Box mb={{ xs: 4, md: 10 }}>
               <Header />
            </Box>
            <Grow in>
               <Container maxWidth="lg">
                  <Grid container spacing={4}>
                     <Grid item xs={12} md={6}>
                        <Stack spacing={{ xs: 4, md: 8 }}>
                           <AboutSection />
                           <TestimonialSection />
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
