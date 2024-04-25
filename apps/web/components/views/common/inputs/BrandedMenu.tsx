import { Menu } from "@mui/material"
import { MenuProps } from "@mui/material"
import { styled, alpha } from "@mui/material/styles"

const BrandedMenu = styled((props: MenuProps) => (
   <Menu elevation={0} {...props} />
))(({ theme }) => ({
   "& .MuiPaper-root": {
      borderRadius: "6px",
      border: "1px solid #ECECEC",
      boxShadow: "0px 0px 8px 0px rgba(20, 20, 20, 0.06)",
      filter: "none",
      minWidth: 120,
      "& .MuiMenu-list": {
         padding: 0,
      },
      "& .MuiMenuItem-root": {
         padding: theme.spacing(1, 2),
         fontSize: "1rem",
         lineHeight: "1.42857rem",
         "& .MuiSvgIcon-root": {
            fontSize: 18,
            color: theme.palette.text.secondary,
            marginRight: theme.spacing(1),
         },
         "&:active": {
            backgroundColor: alpha(
               theme.palette.grey.main,
               theme.palette.action.selectedOpacity
            ),
         },
      },
      "& .MuiDivider-root": {
         margin: 0,
      },
   },
}))

export default BrandedMenu
