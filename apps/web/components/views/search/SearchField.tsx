import { Box, Stack, Typography, useTheme } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/router"
import { useCallback, useState } from "react"
import { ChevronLeft, Clock } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { BrandedSearchField } from "../common/inputs/BrandedSearchField"
import { useSearchContext } from "./SearchContext"

// Animation configuration
const ANIMATION_DURATION = 0.25

type AnimationState = "idle" | "opening" | "open" | "closing"

const styles = sxStyles({
   backStack: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 1,
   },
   backButton: {
      fontSize: 24,
      color: "neutral.800",
      display: "flex",
      cursor: "pointer",
   },
})

type SearchFieldProps = {
   type?: "main" | "backButton"
}

export const SearchField = ({ type = "main" }: SearchFieldProps) => {
   const {
      searchQuery,
      setSearchQuery,
      handleSearchSubmit,
      handleDropdownSelect,
   } = useSearchContext()
   const isMobile = useIsMobile()
   const theme = useTheme()
   const router = useRouter()
   const [animationState, setAnimationState] = useState<AnimationState>("idle")

   // Derived states for cleaner logic
   const isSearchFocused = animationState !== "idle"
   const showMobileDrawer =
      animationState === "opening" || animationState === "open"
   const isClosing = animationState === "closing"
   const showDrawerContent = animationState === "open"
   const showDrawerSearchField =
      animationState === "open" || animationState === "opening"

   const shouldFadeBackground = isMobile && isSearchFocused && !isClosing

   // Animation styles
   const createFullScreenStyle = (zIndex: number, additionalProps = {}) => ({
      position: "fixed" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "#F7F8FC",
      zIndex,
      ...additionalProps,
   })

   const drawerStyle = createFullScreenStyle(theme.zIndex.drawer, {
      display: "flex" as const,
      flexDirection: "column" as const,
      padding: "20px",
   })

   const backgroundStyle = createFullScreenStyle(theme.zIndex.drawer - 1, {
      pointerEvents: "none" as const,
   })

   const handleSearchFocus = useCallback(() => {
      if (isMobile) {
         setAnimationState("opening")
      }
   }, [isMobile])

   const closeDrawer = useCallback(() => {
      setAnimationState("closing")
   }, [])

   const handleDrawerAnimationComplete = useCallback(() => {
      if (animationState === "opening") {
         setAnimationState("open")
      }
   }, [animationState])

   const handleClosingAnimationComplete = useCallback(() => {
      if (animationState === "closing") {
         setAnimationState("idle")
      }
   }, [animationState])

   const handleBackClick = useCallback(() => {
      closeDrawer()
   }, [closeDrawer])

   const handleExitClick = () => {
      router.push("/portal")
   }

   const handleSelectOption = useCallback(
      (option: string) => {
         handleDropdownSelect(option)
         handleBackClick()
      },
      [handleDropdownSelect, handleBackClick]
   )

   const handleSubmit = useCallback(
      (option: string) => {
         if (option.trim().length > 0) {
            handleSearchSubmit(option)
            handleBackClick()
         }
      },
      [handleSearchSubmit, handleBackClick]
   )

   const handleEnterKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
         if (e.key === "Enter") {
            if (searchQuery.trim().length > 0) {
               handleSubmit(searchQuery)
            }
         }
      },
      [handleSubmit, searchQuery]
   )

   return (
      <Box sx={{ position: "relative", width: "100%", mx: "auto" }}>
         {/* Background fade overlay */}
         <AnimatePresence>
            {Boolean(shouldFadeBackground) && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: ANIMATION_DURATION }}
                  style={backgroundStyle}
               />
            )}
         </AnimatePresence>

         {/* Mobile drawer */}
         <AnimatePresence>
            {Boolean(showMobileDrawer) && (
               <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="search-drawer-title"
                  aria-describedby="search-drawer-description"
                  initial={{ opacity: 0, x: 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                     duration: ANIMATION_DURATION,
                  }}
                  onAnimationComplete={handleDrawerAnimationComplete}
                  style={drawerStyle}
               >
                  {/* Drawer header with back button and search field */}
                  {Boolean(showDrawerSearchField) && (
                     <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                           duration: ANIMATION_DURATION * 0.3,
                        }}
                     >
                        <Stack sx={[styles.backStack, { mb: 3 }]}>
                           <Box
                              component={ChevronLeft}
                              sx={styles.backButton}
                              onClick={handleBackClick}
                           />
                           <Box sx={{ flex: 1 }}>
                              <motion.div
                                 layoutId={"search-field"}
                                 style={{
                                    width: "100%",
                                 }}
                                 transition={{
                                    layout:
                                       animationState !== "opening"
                                          ? { duration: 0, ease: "linear" }
                                          : {
                                               duration: ANIMATION_DURATION,
                                               ease: [0.4, 0.0, 0.2, 1],
                                            },
                                 }}
                              >
                                 <BrandedSearchField
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    placeholder="What are you looking for?"
                                    showStartIcon={false}
                                    autoFocus={true}
                                    onKeyDown={handleEnterKeyDown}
                                 />
                              </motion.div>
                           </Box>
                        </Stack>
                     </motion.div>
                  )}

                  {/* Drawer content */}
                  <AnimatePresence>
                     {Boolean(showDrawerContent) && (
                        <motion.div
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{
                              duration: ANIMATION_DURATION * 0.5,
                           }}
                        >
                           <RecentSearches
                              onOptionSelect={handleSelectOption}
                           />
                           <SuggestedSearches
                              onOptionSelect={handleSelectOption}
                           />
                        </motion.div>
                     )}
                  </AnimatePresence>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Main page search field */}
         <motion.div
            layoutId="search-field"
            style={{
               position: "relative",
               width: "100%",
            }}
            transition={{
               layout:
                  animationState !== "opening"
                     ? { duration: 0, ease: "linear" }
                     : {
                          duration: ANIMATION_DURATION,
                          ease: [0.4, 0.0, 0.2, 1],
                       },
            }}
            onAnimationComplete={handleClosingAnimationComplete}
         >
            <Stack sx={[styles.backStack, { mx: isMobile ? 1.5 : 0 }]}>
               {isMobile && type === "backButton" ? (
                  <Box
                     component={ChevronLeft}
                     sx={styles.backButton}
                     onClick={handleExitClick}
                  />
               ) : null}
               <Box
                  sx={{ mx: isMobile ? 0 : 2, mt: isMobile ? 0 : 2, flex: 1 }}
               >
                  <BrandedSearchField
                     value={searchQuery}
                     onChange={setSearchQuery}
                     placeholder="What are you looking for?"
                     onFocus={handleSearchFocus}
                     onClear={handleSearchFocus}
                     enableDropdown={!isMobile}
                     showStartIcon={
                        type === "main" || (type === "backButton" && !isMobile)
                     }
                     onKeyDown={handleEnterKeyDown}
                  >
                     {({ close }) => (
                        <>
                           <RecentSearches
                              onOptionSelect={(option) => {
                                 handleSelectOption(option)
                                 close()
                              }}
                           />
                           <SuggestedSearches
                              onOptionSelect={(option) => {
                                 handleSelectOption(option)
                                 close()
                              }}
                           />
                        </>
                     )}
                  </BrandedSearchField>
               </Box>
            </Stack>
         </motion.div>
      </Box>
   )
}

type SuggestedSearchesProps = {
   onOptionSelect: (option: string) => void
}

const RecentSearches = ({ onOptionSelect }: SuggestedSearchesProps) => {
   const isMobile = useIsMobile()
   const { recentSearches, removeRecentSearch } = useSearchContext()

   if (recentSearches.length === 0) {
      return null
   }

   return (
      <Box sx={{ mb: isMobile ? 1 : 1.5 }}>
         <Box
            sx={{
               px: isMobile ? 0 : 1.5,
               pt: isMobile ? 1 : 1.5,
            }}
         >
            <Typography
               variant="brandedBody"
               color="neutral.800"
               fontWeight={600}
            >
               Recent searches
            </Typography>
         </Box>
         <BrandedSearchField.DropdownList
            onSelect={onOptionSelect}
            options={recentSearches}
            startIcon={Clock}
            onDelete={removeRecentSearch}
            showDeleteButtons={true}
         />
      </Box>
   )
}

const searchSuggestions = [
   "Application Process",
   "Engineering",
   "Consulting",
   "Internships",
   "Automotive",
]

const SuggestedSearches = ({ onOptionSelect }: SuggestedSearchesProps) => {
   const isMobile = useIsMobile()

   return (
      <Box>
         <Box
            sx={{
               px: isMobile ? 0 : 1.5,
               pt: isMobile ? 1 : 1.5,
            }}
         >
            <Typography
               variant="brandedBody"
               color="neutral.800"
               fontWeight={600}
            >
               Suggested searches
            </Typography>
         </Box>
         <BrandedSearchField.DropdownList
            onSelect={onOptionSelect}
            options={searchSuggestions}
         />
      </Box>
   )
}
