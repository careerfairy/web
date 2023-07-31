import { RootState } from "../"

export const deleteUserFailSelector = (state: RootState) =>
   state.auth.deleteUser.error
