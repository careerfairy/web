// material-ui
import { Box, styled } from "@mui/material"
import Stack from "@mui/material/Stack"

// react feather
import { HelpCircle } from "react-feather"

// project imports
import { SettingsIcon } from "components/views/common/icons"
import { Fragment } from "react"
import { useGroup } from "."
import { supportPageLink } from "../../constants/links"
import { NavLink } from "../common/NavList"

const Divider = styled(Box)({
   border: "1px solid #DDDDDD",
   width: "calc(100% - 32px)",
   px: 2,
})

const LinksList = styled(Stack)(({ theme }) => ({
   padding: theme.spacing(2, 2, 3, 2),
   justifyContent: "center",
   width: "100%",
}))

export const GroupBottomLinks = () => {
   const { shrunkLeftMenuIsActive, group } = useGroup()

   return (
      <Fragment>
         <Divider />
         <LinksList spacing={2}>
            <NavLink
               href={`/group/${group.id}/admin/settings/general`}
               pathname={`/group/[groupId]/admin/settings/general`}
               activePathPrefix={`/group/[groupId]/admin/settings`}
               id={"settings-page"}
               baseTextColor={"text.primary"}
               title={shrunkLeftMenuIsActive ? "" : "Settings"}
               Icon={SettingsIcon}
            />
            <NavLink
               href={supportPageLink}
               id={"support-page"}
               baseTextColor={"text.primary"}
               title={shrunkLeftMenuIsActive ? "" : "Support"}
               Icon={HelpCircle}
               external
            />
         </LinksList>
      </Fragment>
   )
}
