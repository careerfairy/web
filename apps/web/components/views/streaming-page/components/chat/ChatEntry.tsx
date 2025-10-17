import { LivestreamChatEntry } from "@careerfairy/shared-lib/livestreams"
import { Box, Collapse, Fade, IconButton, Stack, Typography } from "@mui/material"
import LinkifyText from "components/util/LinkifyText"
import { useAuth } from "HOCs/AuthProvider"
import { forwardRef, memo, useEffect, useRef, useState } from "react"
import { MoreVertical } from "react-feather"
import { sxStyles } from "types/commonTypes"
import DateUtil from "util/DateUtil"
import { useStreamingContext } from "../../context"
import { UserType } from "../../util"
import { UserDetails } from "../UserDetails"
import { getChatAuthor, getIsMe } from "./util"
import { useToggleChatReaction } from "components/custom-hook/streaming/useToggleChatReaction"

type ReactionType = "thumbsUp" | "wow" | "laughing" | "heart"

const REACTION_EMOJIS: Record<ReactionType, string> = {
   thumbsUp: "👍",
   wow: "😮",
   laughing: "😂",
   heart: "❤️",
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
   reactionOptionActive: {
      backgroundColor: "primary.100",
   },
   reactionOptionHover: {
      thumbsUp: {
         "&:hover": {
            backgroundColor: "primary.100",
            transform: "scale(1.1)",
         },
      },
      heart: {
         "&:hover": {
            backgroundColor: "#FFE8E8",
            transform: "scale(1.1)",
         },
      },
      wow: {
         "&:hover": {
            backgroundColor: "#FFF4E6",
            transform: "scale(1.1)",
         },
      },
      laughing: {
         "&:hover": {
            backgroundColor: "#FFF9E6",
            transform: "scale(1.1)",
         },
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
   reactionCountActive: {
      backgroundColor: "primary.100",
   },
})

type Props = {
   entry: LivestreamChatEntry
   onOptionsClick: (event: React.MouseEvent<HTMLElement>) => void
}

/**
 * Prevents unnecessary re-renders by comparing document ids and reactions in props.
 * @param prevProps Previous component props.
 * @param nextProps Next component props.
 * @returns True if the props are equal, false otherwise.
 */
const propsAreEqual = (prevProps: Props, nextProps: Props) =>
   prevProps.entry.id === nextProps.entry.id &&
   prevProps.entry.thumbsUp?.length === nextProps.entry.thumbsUp?.length &&
   prevProps.entry.wow?.length === nextProps.entry.wow?.length &&
   prevProps.entry.laughing?.length === nextProps.entry.laughing?.length &&
   prevProps.entry.heart?.length === nextProps.entry.heart?.length

export const ChatEntry = memo(
   forwardRef<HTMLDivElement, Props>(({ entry, onOptionsClick }, ref) => {
      const userType = getChatAuthor(entry)
      const timeSinceEntry = useTimeSinceEntry(entry)
      const { authenticatedUser, userData } = useAuth()
      const { isHost, agoraUserId, livestreamId } = useStreamingContext()

      const isMe = getIsMe(
         entry,
         agoraUserId,
         authenticatedUser.email,
         authenticatedUser.uid
      )

      const showOptions = Boolean(isMe || isHost || userData?.isAdmin)

      // Use agoraUserId as the unique identifier for reactions to support multiple speakers
      const userId = agoraUserId || authenticatedUser.uid
      
      const { addReaction, removeReaction } = useToggleChatReaction(
         livestreamId,
         userId
      )

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

      // Get reaction counts and check if user reacted for each type
      const reactions = {
         thumbsUp: {
            count: entry.thumbsUp?.length || 0,
            hasUserReacted: userId ? entry.thumbsUp?.includes(userId) : false,
         },
         wow: {
            count: entry.wow?.length || 0,
            hasUserReacted: userId ? entry.wow?.includes(userId) : false,
         },
         laughing: {
            count: entry.laughing?.length || 0,
            hasUserReacted: userId ? entry.laughing?.includes(userId) : false,
         },
         heart: {
            count: entry.heart?.length || 0,
            hasUserReacted: userId ? entry.heart?.includes(userId) : false,
         },
      }

      // Calculate total reactions to display
      const totalReactions = Object.values(reactions).reduce(
         (sum, r) => sum + r.count,
         0
      )

      // Get all reactions that have at least 1 count, sorted by count descending
      const activeReactions = (Object.entries(reactions) as [ReactionType, typeof reactions.thumbsUp][])
         .filter(([_, r]) => r.count > 0)
         .sort((a, b) => b[1].count - a[1].count)

      // Find which reaction the current user has selected (if any)
      const userSelectedReaction = (Object.entries(reactions) as [ReactionType, typeof reactions.thumbsUp][])
         .find(([_, r]) => r.hasUserReacted)?.[0]

      const handleReactionClick = async (reactionType: ReactionType) => {
         if (!userId) {
            console.warn("User must be authenticated to react to messages")
            return
         }

         try {
            const reaction = reactions[reactionType]
            
            // If clicking the same reaction, remove it
            if (reaction.hasUserReacted) {
               await removeReaction(entry.id, reactionType)
            } else {
               // Remove any existing reaction first (one reaction per user)
               if (userSelectedReaction) {
                  await removeReaction(entry.id, userSelectedReaction)
               }
               // Add the new reaction
               await addReaction(entry.id, reactionType)
            }
            setShowReactionMenu(false)
         } catch (error) {
            console.error("Failed to toggle reaction:", error)
         }
      }

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
               <Typography color="neutral.200" variant="xsmall">
                  {timeSinceEntry}
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
                              userSelectedReaction && styles.reactionCountActive
                           ]}
                        >
                           {activeReactions.length > 0 && (
                              <>
                                 <Typography variant="xsmall">
                                    {activeReactions.map(([type]) => REACTION_EMOJIS[type]).join("")}
                                 </Typography>
                                 <Typography variant="xsmall" color="neutral.800">
                                    {totalReactions}
                                 </Typography>
                              </>
                           )}
                        </Box>
                     </Fade>
                  </Collapse>
                  <Box 
                     sx={styles.reactionIconWrapper}
                     onMouseEnter={handleMouseEnter}
                     onMouseLeave={handleMouseLeave}
                  >
                     {shouldRenderMenu && (
                        <Box 
                           sx={[
                              styles.reactionMenu,
                              menuVisible && styles.reactionMenuVisible
                           ]}
                        >
                           {(Object.entries(REACTION_EMOJIS) as [ReactionType, string][]).map(
                              ([type, emoji]) => (
                                 <Box
                                    key={type}
                                    sx={[
                                       styles.reactionOption,
                                       styles.reactionOptionHover[type],
                                       reactions[type].hasUserReacted && styles.reactionOptionActive
                                    ]}
                                    onClick={() => handleReactionClick(type)}
                                 >
                                    {emoji}
                                 </Box>
                              )
                           )}
                        </Box>
                     )}
                     {userSelectedReaction ? (
                        <Box
                           sx={[
                              styles.reactionIcon,
                              { 
                                 fontSize: "18px",
                                 display: "flex",
                                 alignItems: "center",
                                 justifyContent: "center",
                              }
                           ]}
                        >
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
               </Stack>
            </Stack>
         </Stack>
      )
   }),
   propsAreEqual
)

const useTimeSinceEntry = (entry: LivestreamChatEntry) => {
   const [timeSince, setTimeSince] = useState(() =>
      DateUtil.getTimeAgo(entry.timestamp?.toDate() ?? new Date())
   )

   useEffect(() => {
      // Function to periodically refresh the "time since" string
      const refreshTimeSince = () => {
         setTimeSince(
            DateUtil.getTimeAgo(entry.timestamp?.toDate() ?? new Date())
         )
      }

      // Refresh the "time since" every 30 seconds
      const interval = setInterval(refreshTimeSince, 30000)

      // Clear the interval when the component unmounts
      return () => clearInterval(interval)
   }, [entry.timestamp])

   return timeSince
}

ChatEntry.displayName = "ChatEntry"
