import RootState from "../reducers"

export const groupSelector = (state: RootState) => state.firestore.data.group
