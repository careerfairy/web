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
   sectionTitleWrapper: {
      flex: "1 0 0",
      alignSelf: "center",
   },
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
      position: "relative", // Enable absolute positioning for visual support
      zIndex: 2, // Ensure companies are above visual support
      [theme.breakpoints.up("sm")]: {
         maxWidth: "548px",
      },
      [theme.breakpoints.up("md")]: {
         flex: "1 1 auto",
      },
      [theme.breakpoints.up("sparksFullscreen")]: {
         flex: "0 0 auto",
      },
      [theme.breakpoints.up("lg")]: {
         flex: "1 1 auto",
      },
   }),
   visualSupportContainer: {
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
   },
   // Purple image - top left of companies grid
   visualSupportLeft: {
      position: "absolute",
      left: 0,
      top: 0,
      margin: "-15px -10px",
   },
   // Turquoise image - bottom right of companies grid
   visualSupportRight: {
      position: "absolute",
      right: 0,
      bottom: 0,
      margin: "-10px",
   },
})

interface ParticipatingCompaniesSectionProps {
   companies: Group[]
}

export default function ParticipatingCompaniesSection({
   companies,
}: ParticipatingCompaniesSectionProps) {
   return (
      <Stack sx={styles.section}>
         <Stack sx={styles.sectionTitleWrapper} spacing={1.5}>
            <Typography variant="desktopBrandedH4" sx={styles.sectionTitle}>
               Get to know the participating companies
            </Typography>
            <Typography variant="brandedBody" sx={styles.sectionDescription}>
               Hear directly from some of the most sought-after employers — what
               they value, how they hire, and where they&apos;re headed. Get
               insider tips on what actually matters this job hunt season and
               what could help you stand out.
            </Typography>
         </Stack>

         <Box sx={styles.companiesWrapper}>
            {/* Visual support images - positioned absolutely behind companies grid */}
            <Box aria-hidden sx={styles.visualSupportContainer}>
               <Box aria-hidden sx={styles.visualSupportLeft}>
                  <Image
                     src="/panels/companies-purple-visual-support.svg"
                     alt=""
                     width={339}
                     height={199}
                     priority
                  />
               </Box>
               <Box aria-hidden sx={styles.visualSupportRight}>
                  <Image
                     src="/panels/companies-turquoise-visual-support.svg"
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
                     />
                  </Grid>
               ))}
            </Grid>
         </Box>
      </Stack>
   )
}
