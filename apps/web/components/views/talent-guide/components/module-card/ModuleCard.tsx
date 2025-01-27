import { Stack } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import FramerBox from "components/views/common/FramerBox"
import { Page, TalentGuideModule } from "data/hygraph/types"
import { AnimatePresence } from "framer-motion"
import { useRouter } from "next/router"
import { createContext, forwardRef, useContext, useMemo } from "react"
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
         boxShadow: (theme) => `0 6px 20px ${theme.palette.secondary[100]}40`,
         borderColor: (theme) => theme.palette.secondary[200],
      },
   },
   content: {
      width: "100%",
      padding: {
         xs: "4px 4px 4px 0px",
         md: "12px 0px",
      },
   },
   expandedOverlay: (theme) => ({
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.brand.white[300],
      zIndex: theme.zIndex.drawer + 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
   }),
   expandedCard: {
      width: "90vw",
      height: "90vh",
      maxWidth: "1200px",
      backgroundColor: "white",
      borderRadius: "12px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
})

type ModuleCardContextType = {
   isMobile: boolean
   isExpanded: boolean
}

const ModuleCardContext = createContext<ModuleCardContextType | undefined>(
   undefined
)

type Props = {
   module: Page<TalentGuideModule>
   /**
    * If true, applies the lighting effect to the card
    */
   interactive?: boolean
   isRecommended?: boolean
   onShineAnimationComplete?: () => void
   /**
    * Controls mobile responsiveness. Falls back to auto-detection if omitted
    */
   overrideIsMobile?: boolean
}

export const ModuleCard = forwardRef<HTMLDivElement, Props>(
   (
      {
         module,
         interactive,
         isRecommended,
         onShineAnimationComplete,
         overrideIsMobile,
      },
      ref
   ) => {
      const isDefaultMobile = useIsMobile()
      const router = useRouter()
      const isExpanded = router.query.moduleId === module.slug

      const handleCardClick = (e: React.MouseEvent) => {
         if (interactive) {
            e.preventDefault()
            router.push(
               `?moduleId=${module.slug}`,
               {
                  query: {
                     ...router.query,
                     moduleId: module.slug,
                  },
               },
               {
                  shallow: true,
               }
            )
         }
      }

      const handleClose = () => {
         const newQuery = { ...router.query }
         delete newQuery.moduleId
         router.push(
            "",
            {
               query: newQuery,
            },
            { shallow: true }
         )
      }

      const value = useMemo(
         () => ({
            isMobile: overrideIsMobile ?? isDefaultMobile,
            isExpanded,
         }),
         [overrideIsMobile, isDefaultMobile, isExpanded]
      )

      return (
         <ModuleCardContext.Provider value={value}>
            <FramerBox
               layoutId={`card-${module.slug}`}
               onClick={handleCardClick}
            >
               <Stack
                  ref={ref}
                  component={interactive ? "a" : Stack}
                  href={interactive ? `/levels/${module.slug}` : undefined}
                  direction="row"
                  spacing={1.5}
                  sx={[
                     styles.card,
                     interactive && styles.interactive,
                     isRecommended && styles.recommended,
                  ]}
               >
                  <Thumbnail
                     thumbnailUrl={module.content.moduleIllustration?.url}
                     moduleId={module.slug}
                  />
                  <Stack
                     data-testid="module-card-content"
                     spacing={value.isMobile ? 1 : 1.5}
                     sx={styles.content}
                  >
                     <Status
                        onShineAnimationComplete={onShineAnimationComplete}
                        module={module.content}
                     />
                     <Details module={module.content} />
                  </Stack>
               </Stack>
            </FramerBox>

            <AnimatePresence>
               {Boolean(isExpanded) && (
                  <FramerBox
                     id="expanded-overlay"
                     key="expanded-overlay"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={handleClose}
                     sx={styles.expandedOverlay}
                     layoutId={`card-${module.slug}`}
                  >
                     <Thumbnail
                        thumbnailUrl={module.content.moduleIllustration?.url}
                        moduleId={module.slug}
                        expanded
                     />
                  </FramerBox>
               )}
            </AnimatePresence>
         </ModuleCardContext.Provider>
      )
   }
)

export const useModuleCardContext = () => {
   const context = useContext(ModuleCardContext)
   if (context === undefined) {
      throw new Error("useModuleCardContext must be used within a ModuleCard")
   }
   return context
}

ModuleCard.displayName = "ModuleCard"
