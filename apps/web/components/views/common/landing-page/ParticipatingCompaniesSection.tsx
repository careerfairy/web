import { Group } from "@careerfairy/shared-lib/groups"
import { Box, Grid, Stack, Typography } from "@mui/material"
import { CompanyCard } from "components/views/common/company/CompanyCard"
import Image from "next/image"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   section: (theme) => ({
      gap: 4,
      padding: 0,
      display: "flex",
      flexDirection: "column",
      [theme.breakpoints.up("md")]: {
         flexDirection: "row",
         padding: 1.5,
         gap: 6,
      },
      [theme.breakpoints.up("sparksFullscreen")]: {
         flexDirection: "column",
      },
      [theme.breakpoints.up("lg")]: {
         flexDirection: "row",
      },
   }),
   sectionTitleWrapper: (theme) => ({
      flex: "1 0 0",
      alignSelf: "center",
      [theme.breakpoints.up("md")]: {
         order: 2,
      },
      [theme.breakpoints.up("sparksFullscreen")]: {
         order: 1,
      },
      [theme.breakpoints.up("lg")]: {
         order: 2,
      },
   }),
   sectionTitle: {
      color: "text.primary",
      fontWeight: 700,
   },
   sectionDescription: {
      color: "neutral.700",
   },
   companiesWrapper: (theme) => ({
      maxWidth: "375px",
      alignSelf: "center",
      justifyContent: "center",
      position: "relative",
      zIndex: 2,
      [theme.breakpoints.up("sm")]: {
         maxWidth: "548px",
      },
      [theme.breakpoints.up("md")]: {
         order: 1,
         flex: "1 1 auto",
      },
      [theme.breakpoints.up("sparksFullscreen")]: {
         order: 2,
         flex: "0 0 auto",
      },
      [theme.breakpoints.up("lg")]: {
         order: 1,
         flex: "1 1 auto",
      },
   }),
   visualSupportContainer: {
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
   },
   visualSupportLeft: {
      position: "absolute",
      left: 0,
      top: 0,
      margin: "-15px -10px",
   },
   visualSupportRight: {
      position: "absolute",
      right: 0,
      bottom: 0,
      margin: "-10px",
   },
})

export interface ParticipatingCompaniesSectionConfig {
   title: string
   description: string
   interactionSource: string
}

interface ParticipatingCompaniesSectionProps {
   config: ParticipatingCompaniesSectionConfig
   companies: Group[]
}

export default function ParticipatingCompaniesSection({
   config,
   companies,
}: ParticipatingCompaniesSectionProps) {
   return (
      <Stack sx={styles.section}>
         <Stack sx={styles.sectionTitleWrapper} spacing={1.5}>
            <Typography variant="desktopBrandedH4" sx={styles.sectionTitle}>
               {config.title}
            </Typography>
            <Typography variant="brandedBody" sx={styles.sectionDescription}>
               {config.description}
            </Typography>
         </Stack>

         <Box sx={styles.companiesWrapper}>
            <Box aria-hidden sx={styles.visualSupportContainer}>
               <Box aria-hidden sx={styles.visualSupportLeft}>
                  <Image
                     src="/panels/companies-turquoise-visual-support.svg"
                     alt=""
                     width={339}
                     height={199}
                     priority
                  />
               </Box>
               <Box aria-hidden sx={styles.visualSupportRight}>
                  <Image
                     src="/panels/companies-purple-visual-support.svg"
                     alt=""
                     width={187}
                     height={338}
                     priority
                  />
               </Box>
            </Box>

            <Grid
               container
               spacing={1}
               sx={{ position: "relative", zIndex: 1 }}
            >
               {companies.map((company) => (
                  <Grid
                     key={company.id}
                     item
                     xs={6}
                     sm={4}
                     sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "stretch",
                     }}
                  >
                     <CompanyCard
                        company={company as unknown as Group}
                        variant="small"
                        interactionSource={config.interactionSource as any}
                     />
                  </Grid>
               ))}
            </Grid>
         </Box>
      </Stack>
   )
}
