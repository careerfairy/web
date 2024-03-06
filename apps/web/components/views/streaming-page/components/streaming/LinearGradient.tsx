import { sxStyles } from "types/commonTypes"
import { FloatingContent } from "./VideoTrackWrapper"

const styles = sxStyles({
   root: {
      transition: (theme) => theme.transitions.create("background"),
      background:
         "linear-gradient(180deg, rgba(0, 0, 0, 0.00) 66.5%, rgba(0, 0, 0, 0.12) 75.5%, rgba(0, 0, 0, 0.48) 100%), transparent 50% / cover no-repeat",
   },
   showRight: {
      background: {
         xs: "linear-gradient(180deg, rgba(0, 0, 0, 0.00) 66.5%, rgba(0, 0, 0, 0.12) 75.5%, rgba(0, 0, 0, 0.48) 100%), linear-gradient(90deg, rgba(34, 34, 34, 0.00) 77.5%, rgba(20, 20, 20, 0.18) 86.5%, rgba(0, 0, 0, 0.60) 100%), transparent 50% / cover no-repeat",
         tablet:
            "linear-gradient(180deg, rgba(0, 0, 0, 0.00) 66.5%, rgba(0, 0, 0, 0.12) 75.5%, rgba(0, 0, 0, 0.48) 100%), linear-gradient(90deg, rgba(34, 34, 34, 0.00) 85.51%, rgba(20, 20, 20, 0.20) 90.74%, rgba(0, 0, 0, 0.70) 100%), transparent 50% / cover no-repeat",
      },
   },
   showLeft: {
      background: {
         xs: "linear-gradient(90deg, rgba(0, 0, 0, 0.60) 0%, rgba(20, 20, 20, 0.18) 13.5%, rgba(34, 34, 34, 0.00) 22.5%), linear-gradient(180deg, rgba(0, 0, 0, 0.00) 66.5%, rgba(0, 0, 0, 0.12) 75.5%, rgba(0, 0, 0, 0.48) 100%), transparent 50% / cover no-repeat",
         tablet:
            "linear-gradient(90deg, rgba(0, 0, 0, 0.60) 0%, rgba(20, 20, 20, 0.18) 9.26%, rgba(34, 34, 34, 0.00) 14.49%), linear-gradient(180deg, rgba(0, 0, 0, 0.00) 66.5%, rgba(0, 0, 0, 0.12) 75.5%, rgba(0, 0, 0, 0.48) 100%), transparent 50% / cover no-repeat",
      },
   },
})

export const LinearGradient = () => {
   return <FloatingContent sx={styles.root} />
}
