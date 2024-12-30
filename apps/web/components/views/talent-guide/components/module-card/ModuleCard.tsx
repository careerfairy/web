import { Stack } from "@mui/material"
import { Page, TalentGuideModule } from "data/hygraph/types"
import Link from "next/link"
import { sxStyles } from "types/commonTypes"
import { Details } from "./Details"
import { Status } from "./Status"
import { Thumbnail } from "./Thumbnail"

const styles = sxStyles({
   preventBoxShadowClipping: {
      margin: 1,
      padding: -1,
   },
   card: {
      padding: 1,
      borderRadius: "12px",
      border: (theme) => `1px solid ${theme.palette.secondary[50]}`,
      minWidth: 300,
      textDecoration: "none", // prevent link underline
      color: "inherit", // prevent link color
      transition: (theme) =>
         theme.transitions.create(["transform", "box-shadow", "border-color"]),
   },
   interactive: {
      "&:hover, &:focus": {
         transform: "translateY(-2px) scale(1.005)",
         boxShadow: (theme) => `0 6px 20px ${theme.palette.secondary[100]}40`,
         borderColor: (theme) => theme.palette.secondary[200],
      },
   },
   content: {
      padding: "4px 4px 4px 0px",
   },
})

type Props = {
   module: Page<TalentGuideModule>
   /**
    * If true, the module card will be a link otherwise it will be a stack
    */
   interactive?: boolean
}

export const ModuleCard = ({ module, interactive }: Props) => {
   const CardWrapper = interactive ? Link : Stack
   const cardProps = interactive
      ? {
           href: `/talent-guide/${module.slug}`,
        }
      : {}

   return (
      <Stack
         component={CardWrapper}
         {...cardProps}
         direction="row"
         spacing={1.5}
         sx={[styles.card, interactive && styles.interactive]}
      >
         <Thumbnail thumbnailUrl={module.content.moduleIllustration?.url} />
         <Stack
            data-testid="module-card-content"
            spacing={1}
            sx={styles.content}
         >
            <Status module={module.content} />
            <Details module={module.content} />
         </Stack>
      </Stack>
   )
}
