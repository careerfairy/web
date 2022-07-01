import RootState from "../reducers"

export const deleteUserFailSelector = (state: RootState) =>
   state.auth.deleteUser.error
