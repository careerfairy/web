import Switch, { SwitchProps } from "@mui/material/Switch"
import { styled } from "@mui/material/styles"
import { useField } from "formik"
import { FC } from "react"

const BrandedSwitch = styled((props: SwitchProps) => (
   <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
   width: 42,
   height: 26,
   padding: 0,
   "& .MuiSwitch-switchBase": {
      padding: 0,
      margin: 2,
      transitionDuration: "300ms",
      "&.Mui-checked": {
         transform: "translateX(16px)",
         color: "#fff",
         "& + .MuiSwitch-track": {
            backgroundColor: theme.palette.secondary.main,
            opacity: 1,
            border: 0,
         },
         "&.Mui-disabled + .MuiSwitch-track": {
            opacity: 0.5,
         },
      },
      "&.Mui-focusVisible .MuiSwitch-thumb": {
         color: theme.palette.secondary.main,
         border: "6px solid #fff",
      },
      "&.Mui-disabled .MuiSwitch-thumb": {
         color:
            theme.palette.mode === "light"
               ? theme.palette.grey[100]
               : theme.palette.grey[600],
      },
      "&.Mui-disabled + .MuiSwitch-track": {
         opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
      },
   },
   "& .MuiSwitch-thumb": {
      boxSizing: "border-box",
      width: 22,
      height: 22,
   },
   "& .MuiSwitch-track": {
      borderRadius: 26 / 2,
      backgroundColor: theme.palette.mode === "light" ? "#E3E3E3" : "#39393D",
      opacity: 1,
      transition: theme.transitions.create(["background-color"], {
         duration: 500,
      }),
   },
}))

type FormBrandedSwitchProps = {
   name: string
} & SwitchProps

export const FormBrandedSwitch: FC<FormBrandedSwitchProps> = (props) => {
   const [, , helpers] = useField(props.name)

   return (
      <BrandedSwitch
         {...props}
         onChange={(_, newValue) => {
            helpers.setValue(newValue)
         }}
      />
   )
}

export default BrandedSwitch
