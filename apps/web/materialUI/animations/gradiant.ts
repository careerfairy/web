import makeStyles from "@mui/styles/makeStyles"

const useGradiantStyles = makeStyles(() => ({
   animatedGradiant: {
      background:
         "linear-gradient(white, white) padding-box, linear-gradient(180deg, #e9911d, #dc2743 50%, #e9911d) border-box",
      backgroundRepeat: "no-repeat",
      backgroundSize: "100% 100%, 100% 200%",
      backgroundPosition: "0 0, 0 100%",
      border: "4px solid transparent",
      animation: "$highlight 1s infinite alternate",
   },
   "@keyframes highlight": {
      "0%": { backgroundPosition: "0% 100%" },
      "50%": { backgroundPosition: "100% 0%" },
      "100%": { backgroundPosition: "0% 50%" },
   },
}))

export default useGradiantStyles
