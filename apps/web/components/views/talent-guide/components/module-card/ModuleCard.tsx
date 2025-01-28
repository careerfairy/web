import { Stack } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import FramerBox from "components/views/common/FramerBox"
import { Page, TalentGuideModule } from "data/hygraph/types"
import { AnimatePresence } from "framer-motion"
import Link, { LinkProps } from "next/link"
import { useRouter } from "next/router"
import {
   createContext,
   forwardRef,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react"
import { useLockBodyScroll } from "react-use"
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
      zIndex: theme.zIndex.drawer + 1001,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
   }),
   expandedOverlayDesktop: {
      py: 4.75,
   },
})

type ModuleCardContextType = {
   isMobile: boolean
   isExpanded: boolean
   hasFinishedExpanding: boolean
   module: Page<TalentGuideModule>
   canAnimate: boolean
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
   /**
    * Controls whether the card can expand. Used to delay expansion until parent animations complete.
    */
   canAnimate?: boolean
}

export const ModuleCard = forwardRef<HTMLDivElement, Props>(
   (
      {
         module,
         interactive,
         isRecommended,
         onShineAnimationComplete,
         overrideIsMobile,
         canAnimate = true,
      },
      ref
   ) => {
      const isDefaultMobile = useIsMobile()
      const router = useRouter()
      const isExpanded = router.query.moduleId === module.slug && canAnimate
      const [hasFinishedExpanding, setHasFinishedExpanding] = useState(false)

      // Lock body scroll when overlay is expanded
      useLockBodyScroll(isExpanded)

      const handleCardClick = () => {
         if (interactive && canAnimate) {
            setHasFinishedExpanding(false)
         }
      }

      const handleClose = useCallback(() => {
         const newQuery = { ...router.query }
         delete newQuery.moduleId
         setHasFinishedExpanding(false)
         router.push(
            "",
            {
               query: newQuery,
            },
            { shallow: true }
         )
      }, [router])

      useEffect(() => {
         const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === "Escape" && isExpanded) {
               handleClose()
            }
         }

         if (isExpanded) {
            document.addEventListener("keydown", handleEscapeKey)
         }

         return () => {
            document.removeEventListener("keydown", handleEscapeKey)
         }
      }, [isExpanded, handleClose])

      const handleAnimationComplete = () => {
         setHasFinishedExpanding(true)
      }

      const value = useMemo<ModuleCardContextType>(
         () => ({
            isMobile: overrideIsMobile ?? isDefaultMobile,
            isExpanded,
            hasFinishedExpanding,
            module,
            canAnimate,
         }),
         [
            overrideIsMobile,
            isDefaultMobile,
            isExpanded,
            hasFinishedExpanding,
            module,
            canAnimate,
         ]
      )

      const linkProps: LinkProps = {
         href: {
            pathname: "/levels",
            query: {
               ...router.query,
               moduleId: module.slug,
            },
         },
         shallow: true,
         scroll: false,
      }

      const props = interactive && canAnimate ? linkProps : {}

      return (
         <ModuleCardContext.Provider value={value}>
            <FramerBox
               layoutId={`card-${module.slug}`}
               onClick={handleCardClick}
            >
               <Stack
                  ref={ref}
                  component={interactive && canAnimate ? Link : Stack}
                  {...props}
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
                     sx={[
                        styles.expandedOverlay,
                        !value.isMobile && styles.expandedOverlayDesktop,
                     ]}
                     layoutId={`card-${module.slug}`}
                     onLayoutAnimationComplete={handleAnimationComplete}
                  >
                     <Thumbnail
                        thumbnailUrl={module.content.moduleIllustration?.url}
                        moduleId={module.slug}
                        onClose={handleClose}
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
