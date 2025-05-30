import { Tab, Tabs } from "@mui/material"
import { SyntheticEvent } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   tab: {
      p: "8px 16px",
      fontSize: "16px",
      fontWeight: 400,
      textTransform: "none",
      color: (theme) => theme.palette.neutral[500],
      "&.Mui-selected": {
         color: (theme) => theme.brand.tq[600],
         fontWeight: 600,
      },
   },
})

export type TabId = "overview" | "salary" | "insidelook"

export type TabConfig = {
   id: TabId
   label: string
}

type TabsHeaderProps = {
   tabsConfig: TabConfig[]
   activeTab: TabId
   onTabChange: (event: SyntheticEvent, newValue: TabId) => void
}

export const TabsHeader = ({
   tabsConfig,
   activeTab,
   onTabChange,
}: TabsHeaderProps) => {
   return (
      <Tabs
         value={activeTab}
         onChange={onTabChange}
         variant="fullWidth"
         sx={{
            borderBottom: (theme) => `1px solid ${theme.brand.white[500]}`,
         }}
      >
         {tabsConfig.map((tab) => (
            <Tab
               key={tab.id}
               label={tab.label}
               value={tab.id}
               sx={styles.tab}
            />
         ))}
      </Tabs>
   )
}
