import { PayloadAction, createSlice } from "@reduxjs/toolkit"

interface IGroupDashboardLayoutState {
   layout: {
      leftDrawerOpen: boolean
      mobileProfileDrawerOpen: boolean
      mobileFullScreenMenuOpen: boolean
   }
   manageCompaniesDialogOpen: boolean
}

const initialState: IGroupDashboardLayoutState = {
   layout: {
      leftDrawerOpen: true,
      mobileProfileDrawerOpen: false,
      mobileFullScreenMenuOpen: false,
   },
   manageCompaniesDialogOpen: false,
}

export const groupDashboardLayoutSlice = createSlice({
   name: "Group Dashboard Layout",
   initialState,
   reducers: {
      setLeftDrawer: (state, action: PayloadAction<boolean>) => {
         state.layout.leftDrawerOpen = action.payload
      },
      toggleLeftDrawer: (state) => {
         state.layout.leftDrawerOpen = !state.layout.leftDrawerOpen
      },
      setMobileProfileDrawer: (state, action: PayloadAction<boolean>) => {
         state.layout.mobileProfileDrawerOpen = action.payload
      },
      toggleMobileProfileDrawer: (state) => {
         state.layout.mobileProfileDrawerOpen =
            !state.layout.mobileProfileDrawerOpen
      },
      setMobileFullScreenMenu: (state, action: PayloadAction<boolean>) => {
         state.layout.mobileFullScreenMenuOpen = action.payload
      },
      toggleMobileFullScreenMenu: (state) => {
         state.layout.mobileFullScreenMenuOpen =
            !state.layout.mobileFullScreenMenuOpen
      },
      openManageCompaniesDialog: (state) => {
         state.manageCompaniesDialogOpen = true
      },
      closeManageCompaniesDialog: (state) => {
         state.manageCompaniesDialogOpen = false
      },
   },
})

export const {
   setLeftDrawer,
   toggleLeftDrawer,
   setMobileProfileDrawer,
   toggleMobileProfileDrawer,
   setMobileFullScreenMenu,
   toggleMobileFullScreenMenu,
   openManageCompaniesDialog,
   closeManageCompaniesDialog,
} = groupDashboardLayoutSlice.actions

export default groupDashboardLayoutSlice.reducer
