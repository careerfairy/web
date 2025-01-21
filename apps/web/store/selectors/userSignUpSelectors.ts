import { RootState } from "../"

export const userSignUpStepContinueDisabledSelector = (
   state: RootState,
   step: number
) => state.userSignUp.stepsState[step]?.disableContinue ?? false
