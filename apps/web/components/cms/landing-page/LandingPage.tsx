import {
   HygraphRemoteFieldOfStudyResponse,
   HygraphResponseHero,
} from "../../../types/cmsTypes"
import { sxStyles } from "../../../types/commonTypes"
import React from "react"
import { Hero } from "../blocks"
import { MenuItem, TextField, Box } from "@mui/material"
import Link from "../../views/common/Link"

type Props = {
   fieldsOfStudy: HygraphRemoteFieldOfStudyResponse[]
   hero: HygraphResponseHero
}

const styles = sxStyles({
   wrapper: {
      textAlign: {
         xs: "center",
         lg: "start",
      },
   },
   input: {
      backgroundColor: "white !important",
      boxShadow: 3,
   },
   selector: {
      width: {
         xs: "100%",
         md: "60%",
         lg: "80%",
      },
   },
   selectorItem: {
      color: "black",
   },
})

const LandingPage = ({ fieldsOfStudy, hero }: Props) => {
   return (
      <Hero {...hero}>
         {fieldsOfStudy.length > 0 && (
            <Box sx={styles.wrapper}>
               <TextField
                  select
                  inputProps={{
                     sx: styles.input,
                  }}
                  InputLabelProps={{ shrink: false }}
                  id="fieldOfStudy"
                  name="fieldOfStudy"
                  label={hero?.selectorLabel}
                  fullWidth
                  variant="filled"
                  sx={styles.selector}
               >
                  {fieldsOfStudy.map((entry) => (
                     <Link
                        href={`/landing/${entry.marketingLandingPage?.slug}?fieldOfStudyId=${entry.fieldOfStudyId}`}
                        noLinkStyle
                        key={entry.fieldOfStudyId}
                        sx={styles.selectorItem}
                     >
                        <MenuItem value={entry.fieldOfStudyId}>
                           {entry.fieldOfStudyName}
                        </MenuItem>
                     </Link>
                  ))}
               </TextField>
            </Box>
         )}
      </Hero>
   )
}

export default LandingPage
