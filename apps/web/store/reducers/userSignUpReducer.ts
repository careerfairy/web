import { PayloadAction, createSlice } from "@reduxjs/toolkit"

interface IStepState {
   [step: number]: {
      disableContinue: boolean
   }
}

interface IUserSignUpState {
   stepsState: IStepState
}

const initialState: IUserSignUpState = {
   stepsState: {},
}

type DisableContinuePayload = {
   step: number
   disable: boolean
}

export const userSignUpSlice = createSlice({
   name: "User Sign Up",
   initialState,
   reducers: {
      disableContinue: (
         state,
         action: PayloadAction<DisableContinuePayload>
      ) => {
         state.stepsState[action.payload.step] = {
            disableContinue: action.payload.disable,
         }
      },
   },
})

export const { disableContinue } = userSignUpSlice.actions

export default userSignUpSlice.reducer
