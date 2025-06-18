import { styled } from "@mui/material/styles"

export const StyledHiddenInput = styled("input")({
   position: "absolute",
   width: "0px",
   height: "0px",
   padding: 0,
   margin: "-1px",
   overflow: "hidden",
   clip: "rect(0, 0, 0, 0)",
   whiteSpace: "nowrap",
   border: 0,
   color: "transparent !important",
   caretColor: "transparent !important",
   fontSize: "0px",
   transform: "scale(0) !important",
   opacity: 0,
   textIndent: "-9999px",
   zIndex: -1,
   "&:focus": {
      outline: "none",
      boxShadow: "none",
   },
})
