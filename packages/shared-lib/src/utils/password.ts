export const PASSWORD_RULES = {
   minLength: {
      tester: (password: string) => password.length < 8,
      value: 8,
   },
   minLowercase: {
      tester: (password: string) => !/[a-z]/.test(password),
      value: 1,
   },
   minUppercase: {
      tester: (password: string) => !/[A-Z]/.test(password),
      value: 1,
   },
   minNumbers: {
      tester: (password: string) => !/[0-9]/.test(password),
      value: 1,
   },
   minSymbols: {
      tester: (password: string) => !/[^a-zA-Z0-9]/.test(password),
      value: 1,
   },
}

export const validatePassword = (password: string): true | string => {
   if (PASSWORD_RULES.minLength.tester(password)) {
      return `Password must be at least ${PASSWORD_RULES.minLength.value} characters`
   }
   if (PASSWORD_RULES.minLowercase.tester(password)) {
      return "Password must contain at least one lowercase letter"
   }
   if (PASSWORD_RULES.minUppercase.tester(password)) {
      return "Password must contain at least one uppercase letter"
   }
   if (PASSWORD_RULES.minNumbers.tester(password)) {
      return "Password must contain at least one number"
   }
   // TODO: Check if needed
   // if (PASSWORD_RULES.minSymbols.tester(password)) {
   //     return 'Password must contain at least one special character'
   // }
   return true
}
