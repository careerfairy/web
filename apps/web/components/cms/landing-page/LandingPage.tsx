import {
   HygraphRemoteFieldOfStudyResponse,
   HygraphResponseHero,
} from "../../../types/cmsTypes"
import { sxStyles } from "../../../types/commonTypes"
import React from "react"
import { Hero } from "../blocks"
import { MenuItem, TextField } from "@mui/material"
import Link from "../../views/common/Link"

type Props = {
   fieldsOfStudy: HygraphRemoteFieldOfStudyResponse[]
   hero: HygraphResponseHero
}

const styles = sxStyles({
   input: {
      backgroundColor: "white !important",
      boxShadow: 3,
   },
})

const LandingPage = ({ fieldsOfStudy, hero }: Props) => {
   return (
      <Hero {...hero}>
         {hero.component.__typename === "FieldOfStudySelect" && (
            <TextField
               select
               inputProps={{
                  sx: styles.input,
               }}
               InputLabelProps={{ shrink: false }}
               id="fieldOfStudy"
               name="fieldOfStudy"
               label={hero.component.label}
               fullWidth
               variant="filled"
            >
               {fieldsOfStudy.map((entry) => (
                  <Link
                     href={`/landing/${
                        entry.marketingLandingPage?.slug ||
                        hero.component.fallbackMarketingLandingPage.slug
                     }?fieldOfStudyId=${entry.fieldOfStudyId}`}
                     noLinkStyle
                     key={entry.fieldOfStudyId}
                  >
                     <MenuItem value={entry.fieldOfStudyId}>
                        {entry.fieldOfStudyName}
                     </MenuItem>
                  </Link>
               ))}
            </TextField>
         )}
      </Hero>
   )
}

export default LandingPage
