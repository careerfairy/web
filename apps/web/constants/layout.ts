export const DRAWER_WIDTH = 240

export const NICE_SCROLLBAR_STYLES = {
   "& ::-webkit-scrollbar": {
      width: "3px",
      height: "3px", // Add height for horizontal scrollbar
      backgroundColor: "transparent",
   },
   "& ::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      WebkitBoxShadow: "inset 0 0 6px rgba(0,0,0,.3)",
      backgroundColor: "rgba(0,0,0,.1)",
   },
   "& ::-webkit-scrollbar-horizontal": {
      height: "3px", // Adjust the height of the horizontal scrollbar
   },
}
