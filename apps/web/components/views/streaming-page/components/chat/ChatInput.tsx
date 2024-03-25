import { Box, Fab, OutlinedInput, Stack, Typography } from "@mui/material"
import { useYupForm } from "components/custom-hook/form/useYupForm"
import { Send } from "react-feather"
import { Controller } from "react-hook-form"
import { sxStyles } from "types/commonTypes"
import * as Yup from "yup"

const styles = sxStyles({
   root: {
      px: 2,
      py: 1.5,
      bgcolor: (theme) => theme.brand.white[200],
      borderTop: (theme) => `1px solid ${theme.brand.black[300]}`,
   },
   inputWrapper: {
      flex: 1,
   },
   input: {
      width: "100%",
      borderRadius: "37px",
      height: 40,
      border: (theme) => `1px solid ${theme.palette.neutral[100]}`,
      "& .MuiOutlinedInput-notchedOutline": {
         m: "-4px",
         borderColor: "transparent", // Changes the border color specifically
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
         borderColor: (theme) => theme.brand.info[600],
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
         borderColor: (theme) => theme.brand.info[600],
      },
      "& legend": {
         display: "none",
      },
      "& fieldset": { top: 0 },
   },
   sendButton: {
      height: 40,
      width: 40,
      "& svg": {
         width: 20,
         height: 20,
      },
   },
})

const schema = Yup.object({
   message: Yup.string().required("Message is required"),
}).required()

export type FormValues = Yup.InferType<typeof schema>

export const ChatInput = () => {
   const { control, handleSubmit, reset } = useYupForm({
      schema,
   })

   const onSubmit = (data: FormValues) => {
      console.log(data)
      // Handle your form submission logic here
      reset() // Reset form fields after submission
   }

   return (
      <Stack
         sx={styles.root}
         direction="row"
         alignItems="center"
         spacing={0.625}
         component="form"
         onSubmit={handleSubmit(onSubmit)}
      >
         <Controller
            name="message"
            control={control}
            render={({ field, fieldState: { error } }) => {
               console.log(
                  "🚀 ~ file: ChatInput.tsx:78 ~ ChatInput ~ error:",
                  error
               )
               return (
                  <Box sx={styles.inputWrapper}>
                     <OutlinedInput
                        inputProps={field}
                        sx={styles.input}
                        error={!!error}
                     />
                     {error ? (
                        <Typography variant="xsmall" color="error">
                           {error.message}
                        </Typography>
                     ) : null}
                  </Box>
               )
            }}
         />

         <Fab
            aria-label="Send message"
            color="primary"
            size="small"
            type="submit"
            sx={styles.sendButton}
         >
            <Send />
         </Fab>
      </Stack>
   )
}
