import { Stack } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
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
      padding: {
         xs: 1,
         md: "8px 12px 8px 8px",
      },
      borderRadius: "12px",
      border: (theme) => `1px solid ${theme.palette.secondary[50]}`,
      minWidth: 300,
      width: "100%",
      textDecoration: "none", // prevent link underline
      color: "inherit", // prevent link color
      transition: (theme) => theme.transitions.create(["all"]),
      backgroundColor: (theme) => theme.brand.white[100],
   },
   recommended: {
      animation: "boxShadowFadeIn 0.6s ease-in-out forwards",
      "@keyframes boxShadowFadeIn": {
         "0%": {
            boxShadow: "none",
         },
         "100%": {
            boxShadow:
               "0px 0px 21.161px 0px rgba(0, 210, 170, 0.17), 0px 0px 44.439px 0px rgba(20, 20, 20, 0.08)",
         },
      },
      border: (theme) => `1px solid ${theme.palette.primary[600]}`,
   },
   interactive: {
      "&:hover, &:focus": {
         transform: "translateY(-2px) scale(1.005)",
         boxShadow: (theme) => `0 6px 20px ${theme.palette.secondary[100]}40`,
         borderColor: (theme) => theme.palette.secondary[200],
      },
   },
   content: {
      padding: {
         xs: "4px 4px 4px 0px",
         md: "12px 0px",
      },
   },
   lighting: {
      border: (theme) => `1px solid ${theme.palette.primary[600]}`,
      boxShadow: "0px 0px 20px 0px rgba(0, 210, 170, 0.17)",
   },
})

type Props = {
   module: Page<TalentGuideModule>
   /**
    * If true, the module card will be a link
    */
   interactive?: boolean
   isRecommended?: boolean
   onShineAnimationComplete?: () => void
   /**
    * If true, applies the lighting effect to the card
    */
   hasLighting?: boolean
}

export const ModuleCard = ({
   module,
   interactive,
   isRecommended,
   onShineAnimationComplete,
}: Props) => {
   const isMobile = useIsMobile()

   const CardWrapper = interactive ? Link : Stack
   const cardProps = interactive
      ? {
           href: `/levels/${module.slug}`,
        }
      : {}

   return (
      <Stack
         component={CardWrapper}
         {...cardProps}
         direction="row"
         spacing={1.5}
         sx={[
            styles.card,
            interactive && styles.interactive,
            isRecommended && styles.recommended,
            // hasLighting && styles.lighting,
         ]}
      >
         <Thumbnail thumbnailUrl={module.content.moduleIllustration?.url} />
         <Stack
            data-testid="module-card-content"
            spacing={isMobile ? 1 : 1.5}
            sx={styles.content}
         >
            <Status
               onShineAnimationComplete={onShineAnimationComplete}
               module={module.content}
            />
            <Details module={module.content} />
         </Stack>
      </Stack>
   )
}
