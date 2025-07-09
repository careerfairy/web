import { Box, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { AnimatePresence, motion } from "framer-motion"
import { useCallback, useEffect, useMemo, useState } from "react"
import { ChevronLeft, Clock } from "react-feather"
import BrandedSearchField from "../common/inputs/BrandedSearchField"
import { useSearchContext } from "./SearchContext"

// Animation configuration
const ANIMATION_DURATION = 0.2
const Z_INDEX = {
   BACKGROUND: 9999,
   DRAWER: 10000,
} as const

const SearchField = () => {
   const {
      searchQuery,
      setSearchQuery,
      handleSearchSubmit,
      handleDropdownSelect,
   } = useSearchContext()
   const isMobile = useIsMobile()

   const [isSearchFocused, setIsSearchFocused] = useState(false)
   const [showMobileDrawer, setShowMobileDrawer] = useState(false)
   const [isClosing, setIsClosing] = useState(false)

   const shouldFadeBackground = useMemo(
      () => Boolean(isMobile) && Boolean(isSearchFocused) && !isClosing,
      [isSearchFocused, isClosing, isMobile]
   )

   const originalFieldZIndex = useMemo(() => {
      // When search is focused but drawer not yet shown, keep high z-index
      if (isSearchFocused && !showMobileDrawer && !isClosing) {
         return Z_INDEX.DRAWER
      }
      // When animation is complete, return to original z-index (auto)
      return "auto"
   }, [showMobileDrawer, isClosing, isSearchFocused])

   // Handle cleanup when drawer is closed
   useEffect(() => {
      if (!showMobileDrawer && isClosing) {
         setIsSearchFocused(false)
         setIsClosing(false)
      }
   }, [showMobileDrawer, isClosing])

   const handleSearchFocus = useCallback(() => {
      setIsSearchFocused(true)
   }, [])

   const handleSearchBlur = useCallback(() => {
      setIsSearchFocused(false)
      setShowMobileDrawer(false)
   }, [])

   const handleBackgroundAnimationComplete = useCallback(() => {
      if (isSearchFocused && !isClosing && !showMobileDrawer) {
         setShowMobileDrawer(true)
      }
   }, [isSearchFocused, isClosing, showMobileDrawer])

   const handleBackClick = useCallback(() => {
      setIsClosing(true)
      setShowMobileDrawer(false)
   }, [])

   const handleSelectOption = useCallback(
      (option: string) => {
         handleDropdownSelect(option)
         handleBackClick()
      },
      [handleDropdownSelect, handleBackClick]
   )

   const handleSubmit = useCallback(
      (option: string) => {
         handleSearchSubmit(option)
         handleBackClick()
      },
      [handleSearchSubmit, handleBackClick]
   )

   const handleEnterKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
         if (e.key === "Enter") {
            handleSubmit(searchQuery)
         }
      },
      [handleSubmit, searchQuery]
   )

   // Animation styles
   const fullScreenStyle = {
      position: "fixed" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "#F7F8FC",
   }

   const drawerStyle = {
      ...fullScreenStyle,
      zIndex: Z_INDEX.DRAWER,
      display: "flex" as const,
      flexDirection: "column" as const,
      padding: "20px",
   }

   const backgroundStyle = {
      ...fullScreenStyle,
      zIndex: Z_INDEX.BACKGROUND,
      pointerEvents: "none" as const,
   }

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
                  onAnimationComplete={handleBackgroundAnimationComplete}
                  style={backgroundStyle}
               />
            )}
         </AnimatePresence>

         {/* Mobile drawer */}
         <AnimatePresence>
            {Boolean(showMobileDrawer) && (
               <motion.div
                  initial={{ opacity: 0, x: 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ x: "100vw" }}
                  transition={{
                     duration: ANIMATION_DURATION,
                  }}
                  style={drawerStyle}
               >
                  {/* Drawer header */}
                  <Stack
                     direction="row"
                     justifyContent="space-between"
                     alignItems="center"
                     sx={{ mb: 3, gap: 1 }}
                  >
                     <motion.div>
                        <Box
                           component={ChevronLeft}
                           sx={{
                              fontSize: 24,
                              color: "neutral.800",
                              display: "flex",
                           }}
                           onClick={handleBackClick}
                        />
                     </motion.div>

                     {/* Search field in mobile drawer */}
                     <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                           delay: 0.05,
                           duration: ANIMATION_DURATION,
                        }}
                        style={{ flex: 1 }}
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
                  </Stack>
                  <RecentSearches onOptionSelect={handleSelectOption} />
                  <SuggestedSearches onOptionSelect={handleSelectOption} />
               </motion.div>
            )}
         </AnimatePresence>

         {/* Main page search field */}
         <motion.div
            style={{
               position: "relative",
               zIndex: originalFieldZIndex,
               width: "100%",
               marginBottom: "12px",
            }}
            animate={{
               opacity: showMobileDrawer ? 0 : 1,
            }}
            transition={{ duration: isClosing ? 0 : ANIMATION_DURATION }}
            initial={{ opacity: 1 }}
         >
            <Box sx={{ mx: 2, mt: isMobile ? 0 : 2 }}>
               <BrandedSearchField
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="What are you looking for?"
                  onFocus={handleSearchFocus}
                  onBlur={showMobileDrawer ? () => {} : handleSearchBlur}
                  enableDropdown={!isMobile}
                  onKeyDown={handleEnterKeyDown}
               >
                  <RecentSearches onOptionSelect={handleSelectOption} />
                  <SuggestedSearches onOptionSelect={handleSelectOption} />
               </BrandedSearchField>
            </Box>
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
               Recent Searches
            </Typography>
         </Box>
         <BrandedSearchField.DropdownList
            onOptionSelect={onOptionSelect}
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
   "Food Industry",
   "Auto Industry",
   "Jobs in tech",
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
               Suggested Searches
            </Typography>
         </Box>
         <BrandedSearchField.DropdownList
            onOptionSelect={onOptionSelect}
            options={searchSuggestions}
         />
      </Box>
   )
}

export default SearchField
