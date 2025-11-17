import { LivestreamChatEntry } from "@careerfairy/shared-lib/livestreams"
import {
   Box,
   Collapse,
   Fade,
   IconButton,
   Stack,
   Typography,
} from "@mui/material"
import { useStreamIsMobile } from "components/custom-hook/streaming/useStreamIsMobile"
import LinkifyText from "components/util/LinkifyText"
import { forwardRef, useEffect, useRef, useState } from "react"
import { MoreVertical } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { UserType } from "../../util"
import { UserDetails } from "../UserDetails"
import { getChatAuthor, REACTION_EMOJIS, ReactionType } from "./util"

const REACTION_COLORS: Record<ReactionType, string | ((theme: any) => string)> =
   {
      thumbsUp: "#FFF0CC",
      heart: (theme) => theme.brand.error[50],
      wow: "#FFF4E6",
   }

const styles = sxStyles({
   root: {
      position: "relative",
      px: 2,
      py: 1.5,
   },
   background: {
      [UserType.Streamer]: {
         bgcolor: "#FAF9FF",
      },
      [UserType.CareerFairy]: {
         bgcolor: "#F9FFFE",
      },
      [UserType.Viewer]: {
         bgcolor: "none",
      },
   },
   text: {
      wordBreak: "break-word",
      whiteSpace: "pre-line",
      lineHeight: "142.857%",
   },
   optionsIcon: {
      "& svg": {
         width: 21,
         height: 21,
         color: (theme) => theme.brand.black[600],
      },
   },
   reactionContainer: {
      display: "flex",
      alignItems: "center",
   },
   reactionIconWrapper: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      // Extend the hover area to include the menu space
      paddingTop: "8px",
      marginTop: "-8px",
      paddingRight: "16px",
      marginRight: "-16px",
      paddingLeft: "16px",
      marginLeft: "-16px",
   },
   reactionIcon: {
      width: 24,
      height: 24,
      cursor: "pointer",
      opacity: 0.6,
      transition: "opacity 0.2s",
      "&:hover": {
         opacity: 1,
      },
   },
   reactionMenu: {
      position: "absolute",
      bottom: "100%",
      marginBottom: "4px",
      right: 0,
      backgroundColor: (theme) => theme.brand.white[50],
      border: (theme) => `0.5px solid ${theme.brand.white[500]}`,
      boxShadow: "0 0 8px 0 rgba(20, 20, 20, 0.06)",
      borderRadius: "28px",
      p: 1,
      display: "flex",
      gap: 0.75,
      zIndex: 10,
      opacity: 0,
      transform: "translateY(4px)", // Slide from bottom (positive Y)
      transition: "opacity 0.2s ease, transform 0.2s ease",
   },
   reactionMenuVisible: {
      opacity: 1,
      transform: "translateY(0)",
   },
   reactionOption: {
      width: 32,
      height: 32,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      borderRadius: "40px",
      fontSize: "18px",
      transition: "background-color 0.2s, transform 0.1s",
      "&:active": {
         transform: "scale(0.95)",
      },
   },
   reactionOptionHover: {
      thumbsUp: {
         "&:hover": {
            backgroundColor: REACTION_COLORS.thumbsUp,
            transform: "scale(1.1)",
         },
      },
      heart: {
         "&:hover": {
            backgroundColor: REACTION_COLORS.heart,
            transform: "scale(1.1)",
         },
      },
      wow: {
         "&:hover": {
            backgroundColor: REACTION_COLORS.wow,
            transform: "scale(1.1)",
         },
      },
   },
   reactionOptionActive: {
      thumbsUp: {
         backgroundColor: REACTION_COLORS.thumbsUp,
      },
      heart: {
         backgroundColor: REACTION_COLORS.heart,
      },
      wow: {
         backgroundColor: REACTION_COLORS.wow,
      },
   },
   reactionCount: {
      display: "flex",
      alignItems: "center",
      gap: 0.5,
      height: 24,
      px: 1.5,
      py: 0.5,
      borderRadius: "60px",
      backgroundColor: (theme) => theme.brand.white[500],
      transition: "background-color 0.2s ease",
   },
   selectedReactionEmoji: {
      width: 24,
      height: 24,
      cursor: "pointer",
      opacity: 1,
      fontSize: "18px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
   },
   timestampLink: {
      cursor: "pointer",
      "&:hover": {
         color: "primary.main",
      },
   },
})

export type ChatCardReactions = {
   thumbsUp: { count: number; hasUserReacted?: boolean }
   wow: { count: number; hasUserReacted?: boolean }
   heart: { count: number; hasUserReacted?: boolean }
}

/**
 * Creates a ChatCardReactions object from a LivestreamChatEntry.
 * If userId is provided, includes hasUserReacted flags for each reaction type.
 * If userId is not provided, only includes counts (useful for read-only views).
 *
 * @param entry - The chat entry containing reaction arrays
 * @param userId - Optional user ID to check if the user has reacted
 * @returns ChatCardReactions object with counts and optional hasUserReacted flags
 */
export const createChatCardReactions = (
   entry: LivestreamChatEntry,
   userId?: string
): ChatCardReactions => {
   return {
      thumbsUp: {
         count: entry.thumbsUp?.length || 0,
         ...(userId !== undefined && {
            hasUserReacted: entry.thumbsUp?.includes(userId) || false,
         }),
      },
      wow: {
         count: entry.wow?.length || 0,
         ...(userId !== undefined && {
            hasUserReacted: entry.wow?.includes(userId) || false,
         }),
      },
      heart: {
         count: entry.heart?.length || 0,
         ...(userId !== undefined && {
            hasUserReacted: entry.heart?.includes(userId) || false,
         }),
      },
   }
}

type ChatCardProps = {
   entry: LivestreamChatEntry
   timestamp: string
   reactions: ChatCardReactions
   userSelectedReaction?: ReactionType
   showOptions?: boolean
   onOptionsClick?: (event: React.MouseEvent<HTMLElement>) => void
   onReactionClick?: (reactionType: ReactionType) => void
   isReadOnly?: boolean
   onTimestampClick?: () => void
}

export const ChatCard = forwardRef<HTMLDivElement, ChatCardProps>(
   (
      {
         entry,
         timestamp,
         reactions,
         userSelectedReaction,
         showOptions = false,
         onOptionsClick,
         onReactionClick,
         isReadOnly = false,
         onTimestampClick,
      },
      ref
   ) => {
      const isMobile = useStreamIsMobile()
      const userType = getChatAuthor(entry)

      const [showReactionMenu, setShowReactionMenu] = useState(false)
      const [menuVisible, setMenuVisible] = useState(false)
      const [shouldRenderMenu, setShouldRenderMenu] = useState(false)
      const hideMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null)
      const unmountTimeoutRef = useRef<NodeJS.Timeout | null>(null)

      useEffect(() => {
         if (showReactionMenu) {
            // Clear any pending timeouts
            if (hideMenuTimeoutRef.current) {
               clearTimeout(hideMenuTimeoutRef.current)
            }
            if (unmountTimeoutRef.current) {
               clearTimeout(unmountTimeoutRef.current)
            }

            // Mount the menu
            setShouldRenderMenu(true)
            // Trigger enter animation after mount
            requestAnimationFrame(() => {
               setMenuVisible(true)
            })
         } else {
            // Trigger exit animation
            setMenuVisible(false)
            // Unmount after animation completes (200ms transition)
            unmountTimeoutRef.current = setTimeout(() => {
               setShouldRenderMenu(false)
            }, 200)
         }

         // Cleanup function to clear timeouts on unmount or re-run
         return () => {
            if (hideMenuTimeoutRef.current) {
               clearTimeout(hideMenuTimeoutRef.current)
            }
            if (unmountTimeoutRef.current) {
               clearTimeout(unmountTimeoutRef.current)
            }
         }
      }, [showReactionMenu])

      const handleMouseLeave = () => {
         // Add 200ms delay before hiding
         hideMenuTimeoutRef.current = setTimeout(() => {
            setShowReactionMenu(false)
         }, 200)
      }

      const handleMouseEnter = () => {
         // Clear any pending hide timeout
         if (hideMenuTimeoutRef.current) {
            clearTimeout(hideMenuTimeoutRef.current)
            hideMenuTimeoutRef.current = null
         }
         setShowReactionMenu(true)
      }

      const totalReactions = Object.values(reactions).reduce(
         (sum, r) => sum + r.count,
         0
      )

      const activeReactions = (
         Object.entries(reactions) as [
            ReactionType,
            ChatCardReactions["thumbsUp"]
         ][]
      )
         .filter(([_, r]) => r.count > 0)
         .sort((a, b) => b[1].count - a[1].count)

      return (
         <Stack
            spacing={1}
            ref={ref}
            sx={[styles.root, styles.background[userType]]}
         >
            <Stack direction="row" justifyContent="space-between">
               <UserDetails
                  userType={userType}
                  displayName={entry.authorName}
               />
               {Boolean(showOptions) && (
                  <IconButton
                     sx={styles.optionsIcon}
                     onClick={onOptionsClick}
                     size="small"
                  >
                     <MoreVertical />
                  </IconButton>
               )}
            </Stack>
            <Typography
               color="neutral.800"
               variant="small"
               component="p"
               sx={styles.text}
            >
               <LinkifyText>{entry.message}</LinkifyText>
            </Typography>
            <Stack direction="row" sx={styles.reactionContainer}>
               <Typography
                  color="neutral.200"
                  variant="xsmall"
                  onClick={
                     isReadOnly && onTimestampClick
                        ? onTimestampClick
                        : undefined
                  }
                  sx={
                     isReadOnly && onTimestampClick
                        ? styles.timestampLink
                        : undefined
                  }
               >
                  {timestamp}
               </Typography>
               <Stack direction="row" alignItems="center" ml="auto" gap={1}>
                  <Collapse
                     in={totalReactions > 0}
                     orientation="horizontal"
                     timeout={300}
                  >
                     <Fade in={totalReactions > 0} timeout={300}>
                        <Box
                           sx={[
                              styles.reactionCount,
                              userSelectedReaction && {
                                 backgroundColor:
                                    REACTION_COLORS[userSelectedReaction],
                              },
                           ]}
                        >
                           {activeReactions.length > 0 && (
                              <>
                                 <Typography variant="xsmall">
                                    {activeReactions
                                       .map(([type]) => REACTION_EMOJIS[type])
                                       .join("")}
                                 </Typography>
                                 <Typography
                                    variant="xsmall"
                                    color="neutral.800"
                                 >
                                    {totalReactions}
                                 </Typography>
                              </>
                           )}
                        </Box>
                     </Fade>
                  </Collapse>
                  {!isReadOnly && (
                     <Box
                        sx={styles.reactionIconWrapper}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                     >
                        {Boolean(shouldRenderMenu) && (
                           <Box
                              sx={[
                                 styles.reactionMenu,
                                 menuVisible && styles.reactionMenuVisible,
                                 isMobile && { marginRight: "16px" },
                              ]}
                           >
                              {(
                                 Object.entries(REACTION_EMOJIS) as [
                                    ReactionType,
                                    string
                                 ][]
                              ).map(([type, emoji]) => (
                                 <Box
                                    key={type}
                                    sx={[
                                       styles.reactionOption,
                                       styles.reactionOptionHover[type],
                                       reactions[type].hasUserReacted &&
                                          styles.reactionOptionActive[type],
                                    ]}
                                    onClick={() => {
                                       onReactionClick?.(type)
                                       setShowReactionMenu(false)
                                    }}
                                 >
                                    {emoji}
                                 </Box>
                              ))}
                           </Box>
                        )}
                        {userSelectedReaction ? (
                           <Box sx={styles.selectedReactionEmoji}>
                              {REACTION_EMOJIS[userSelectedReaction]}
                           </Box>
                        ) : (
                           <Box
                              component="img"
                              src="https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/Chat-reaction-icon.svg?alt=media&token=6dc8149c-ee79-4fc7-88e5-44e24899b07c"
                              alt="React to message"
                              sx={styles.reactionIcon}
                           />
                        )}
                     </Box>
                  )}
               </Stack>
            </Stack>
         </Stack>
      )
   }
)

ChatCard.displayName = "ChatCard"
