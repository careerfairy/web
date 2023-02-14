import { Group } from "@careerfairy/shared-lib/groups"
import Header from "./Header"
import {
   createContext,
   useCallback,
   useContext,
   useMemo,
   useState,
} from "react"
import { Box, Container, Grid, Grow } from "@mui/material"
import AboutSection from "./AboutSection"
import TestimonialsSection from "./TestimonialsSection"
import StreamSection from "./StreamSection"
import MediaSection from "./MediaSection"

type Props = {
   group: Group
}

export enum TabValue {
   profile = "profile",
   videos = "videos",
   testimonials = "testimonials",
   livesStreams = "livesStreams",
}

type ICompanyPageContext = {
   group: Group
   tabValue: TabValue
   changeTabValue: (tabValues: TabValue) => void
}

const CompanyPageContext = createContext<ICompanyPageContext>({
   group: null,
   tabValue: TabValue.profile,
   changeTabValue: () => {},
})

const CompanyPageOverview = ({ group }: Props) => {
   const [tabValue, setTabValue] = useState(TabValue.profile as TabValue)

   const handleChangeTabValue = useCallback((tabValue) => {
      setTabValue(tabValue)
   }, [])

   const contextValue = useMemo(
      () => ({
         group,
         tabValue,
         changeTabValue: handleChangeTabValue,
      }),
      [group, handleChangeTabValue, tabValue]
   )

   return (
      <CompanyPageContext.Provider value={contextValue}>
         <Box height={{ xs: "550px", md: "400px" }}>
            <Header />
         </Box>

         <Grow in>
            <Container
               maxWidth="lg"
               disableGutters
               sx={{ flex: 1, display: "flex" }}
            >
               <Grid container>
                  <Grid item xs={6}>
                     <AboutSection />
                     <TestimonialsSection />
                     <StreamSection />
                  </Grid>
                  <Grid item xs={6}>
                     <MediaSection />
                  </Grid>
               </Grid>
            </Container>
         </Grow>
      </CompanyPageContext.Provider>
   )
}

export const useCompanyPage = () =>
   useContext<ICompanyPageContext>(CompanyPageContext)

export default CompanyPageOverview
