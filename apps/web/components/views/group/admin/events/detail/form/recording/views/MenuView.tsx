import { Box, Stack, Typography } from "@mui/material"
import {
   ChevronRight,
   Edit2,
   HelpCircle,
   List,
   MessageCircle,
   Zap,
} from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      display: "flex",
      flexDirection: "column",
      gap: 1,
   },
   item: {
      p: 1.5,
      borderRadius: 1.5,
      backgroundColor: (theme) => theme.brand.white[200],
      cursor: "pointer",
      transition: (theme) =>
         theme.transitions.create(["background-color"], {
            duration: theme.transitions.duration.short,
         }),
      "&:hover": {
         backgroundColor: (theme) => theme.brand.white[400],
      },
   },

   headerRow: {
      display: "flex",
      alignItems: "center",
      gap: 1,
      width: "100%",
   },
   titleGroup: {
      display: "flex",
      alignItems: "center",
      gap: 1,
      flexGrow: 1,
      minWidth: 0,
   },
   title: {
      color: "text.primary",
   },
   description: {
      color: "text.secondary",
   },
   subduedText: {
      opacity: 0.6,
   },
   pill: {
      display: "inline-flex",
      alignItems: "center",
      px: 1,
      py: 0.5,
      borderRadius: 27,
      backgroundColor: (theme) => theme.brand.white[400],
      border: (theme) => `0.5px solid ${theme.brand.purple[200]}`,
   },
   pillText: {
      color: "secondary.main",
      textAlign: "center",
   },
   iconWrap: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      "& svg": { width: 16, height: 16 },
      color: "text.primary",
   },
   onlyMobile: {
      display: { xs: "block", md: "none" },
   },
})

type MenuItemProps = {
   icon: React.ReactNode
   title: string
   description?: string
   comingSoon?: boolean
   onlyMobile?: boolean
   onClick?: () => void
}

const MenuItem = ({
   icon,
   title,
   description,
   comingSoon,
   onlyMobile,
   onClick,
}: MenuItemProps) => {
   const isDisabled = !onClick

   return (
      <Box
         sx={[styles.item, onlyMobile && styles.onlyMobile]}
         onClick={isDisabled ? undefined : onClick}
      >
         <Box sx={styles.headerRow}>
            <Box sx={[styles.iconWrap, comingSoon && styles.subduedText]}>
               {icon}
            </Box>
            <Box sx={styles.titleGroup}>
               <Typography
                  variant="medium"
                  sx={[styles.title, comingSoon && styles.subduedText]}
               >
                  {title}
               </Typography>
               {comingSoon ? (
                  <Box sx={styles.pill}>
                     <Typography variant="xsmall" sx={styles.pillText}>
                        Coming soon!
                     </Typography>
                  </Box>
               ) : null}
            </Box>
            <Box sx={comingSoon ? styles.subduedText : undefined}>
               <ChevronRight size={16} />
            </Box>
         </Box>
         {description ? (
            <Typography
               variant="small"
               sx={[styles.description, comingSoon && styles.subduedText]}
            >
               {description}
            </Typography>
         ) : null}
      </Box>
   )
}

type MenuViewProps = {
   onNavigate: (view: RecordingPanelView) => void
}

export type RecordingPanelView =
   | "menu"
   | "edit-details"
   | "questions"
   | "chat"
   | "highlights"
   | "chapters"

export const MenuView = ({ onNavigate }: MenuViewProps) => {
   return (
      <Stack sx={styles.root}>
         <MenuItem
            icon={<Edit2 size={16} />}
            title="Edit details"
            description="Need to update your recording's details? Change the title and description anytime."
            onlyMobile
            onClick={() => onNavigate("edit-details")}
         />
         <MenuItem
            icon={<HelpCircle size={16} />}
            title="Questions"
            description="See all questions that were submitted by your audience and check your answers!"
            onClick={() => onNavigate("questions")}
         />
         <MenuItem
            icon={<MessageCircle size={16} />}
            title="Chat"
            description="Want to review an interesting message from the audience? Check the chat history."
            onClick={() => onNavigate("chat")}
         />
         <MenuItem
            icon={<Zap size={16} />}
            title="Highlights"
            description="AI created short and cool extracts of your live stream!"
            comingSoon
            onClick={() => onNavigate("highlights")}
         />
         <MenuItem
            icon={<List size={16} />}
            title="Chapters"
            description="Automatically generated chapters of your recording to help students easily find the most relevant topics!"
            comingSoon
            onClick={() => onNavigate("chapters")}
         />
      </Stack>
   )
}
