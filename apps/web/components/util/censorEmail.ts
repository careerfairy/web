const censorEmail = (email: string): string => {
   // Split the email into username and domain parts.
   const [username] = email.split("@")

   // Keep the first 3 characters of the username and replace the rest with asterisks.
   return username.slice(0, 3) + "*".repeat(username.length - 3)
}

export default censorEmail
