import { sxStyles } from "types/commonTypes"

export const layoutStyles = sxStyles({
   root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100dvh",
      position: "relative",
   },
})

export const feedbackStyles = sxStyles({
   section: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      width: "100%",
   },
   root: {
      border: (theme) => `1px solid ${theme.palette.neutral[200]}`,
      borderRadius: "8px",
      padding: 1.5,
      position: "relative",
      overflow: "hidden",
      maxWidth: 412,
      textAlign: "center",
   },
   title: {
      fontWeight: 700,
   },
   starsContainer: {
      display: "flex",
      gap: 1,
   },
   starButton: {
      padding: 0.5,
      minWidth: "unset",
      color: (theme) => theme.palette.warning.main,
   },
   rating: {
      transition: (theme) => theme.transitions.create("all"),
   },
   ratingPreview: {
      pt: 3,
      pb: 4,
   },
   icon: {
      width: 40,
      height: 40,
   },
   ratingTitle: {
      color: "warning.600",
      fontWeight: 600,
   },
   chipsContainer: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "start",
   },
   chip: {
      margin: "8px 8px 0 0",
   },
   selectedChip: {
      color: (theme) => theme.brand.white,
      backgroundColor: (theme) => theme.palette.primary.main + " !important",
   },
   unselectedChip: {
      color: "neutral.700",
      backgroundColor: "neutral.50",
   },
})

export const congratsStyles = sxStyles({
   congratsRoot: {
      textAlign: "center",
   },
   congratsTitle: {
      color: "neutral.800",
      fontWeight: 700,
      mt: {
         md: 3.6,
      },
   },
   congratsText: {
      color: "neutral.700",
      maxWidth: 323,
   },
})

export const nextModuleStyles = sxStyles({
   section: {
      width: "100%",
      minHeight: "inherit",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
   bottomContent: {
      mt: "auto",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
   bottomTitle: {
      color: "neutral.800",
      fontWeight: 700,
   },
   bottomText: {
      color: "neutral.700",
      textAlign: "center",
   },
   bottomButton: {
      my: 4,
   },
})
