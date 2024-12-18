import { sxStyles } from "types/commonTypes"

export const styles = sxStyles({
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
   container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 2,
      textAlign: "center",
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
})
