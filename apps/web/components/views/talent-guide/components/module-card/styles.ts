import { circularProgressClasses } from "@mui/material/CircularProgress"
import { sxStyles } from "types/commonTypes"

export const statusStyles = sxStyles({
   info: (theme) => ({
      color: "neutral.500",
      border: `1px solid ${theme.palette.neutral[400]}`,
      background: theme.brand.white[300],
   }),
   completed: (theme) => ({
      color: "warning.500",
      border: `1px solid ${theme.palette.warning[300]}`,
      background: "#FEFAF4",
      display: "flex",
      alignItems: "center",
      position: "relative",
      overflow: "hidden",
   }),
   shine: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background:
         "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0) 20%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 80%, transparent 100%)",
      transform: "skewX(-45deg) translateX(-100%)",
      pointerEvents: "none",
   },
   chip: {
      padding: "4px 8px",
      borderRadius: "26px",
   },
   infoText: {
      verticalAlign: "middle",
      "& svg": {
         verticalAlign: "middle",
         margin: "0 6px",
      },
   },
   progressDisplay: (theme) => ({
      border: `1px solid ${theme.brand.white[500]}`,
      borderRadius: "35px",
      padding: "4px 8px",
      background: theme.brand.white[400],
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
   }),
   progress: {
      position: "relative",
      display: "flex",
   },
   backgroundCircle: {
      color: "neutral.100",
      position: "absolute",
      left: 0,
   },
   progressCircle: {
      [`& .${circularProgressClasses.circle}`]: {
         strokeLinecap: "round",
      },
   },
})
