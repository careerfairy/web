import { linkedInRegex } from "@careerfairy/shared-lib/constants/forms"
import { ProfileLink, UserData } from "@careerfairy/shared-lib/users"
import { getSubstringWithEllipsis } from "@careerfairy/shared-lib/utils"
import {
   Box,
   Button,
   FormHelperText,
   Grid,
   Stack,
   TextField,
   Typography,
} from "@mui/material"
import { usePreFetchCityById } from "components/custom-hook/countries/useCityById"
import { usePreFetchCitySearch } from "components/custom-hook/countries/useCitySearch"
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useUserLinks } from "components/custom-hook/user/useUserLinks"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import { CustomLinkCard } from "components/views/common/links/CustomLinkCard"
import { isLinkedInUrl } from "layouts/UserLayout/TalentProfile/Details/Profile/ProfileLinks"
import normalizeUrl from "normalize-url"
import { useCallback, useEffect, useMemo, useState } from "react"
import { PlusCircle, Trash2 } from "react-feather"
import { useDebounce, useLocalStorage } from "react-use"
import { errorLogAndNotify, getIconUrl } from "util/CommonUtil"
import { isWebUri } from "valid-url"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { localStorageReferralCode } from "../../../../constants/localStorageKeys"
import { userRepo } from "../../../../data/RepositoryInstances"
import { sxStyles } from "../../../../types/commonTypes"
import LinkedInInput from "../../common/inputs/LinkedInInput"
import ReferralCodeInput from "../../common/inputs/ReferralCodeInput"

const styles = sxStyles({
   inputLabel: {
      textTransform: "uppercase",
      fontSize: "0.8rem !important",
      fontWeight: "bold",
   },
   linkCardRoot: {
      backgroundColor: (theme) => theme.brand.white[100],
      borderRadius: "8px",
      border: (theme) => `1px solid ${theme.brand.white[500]}`,
      boxShadow: "0px 5px 15px 0px #BDBDBD",
   },
   contentWrapper: {
      p: "16px 12px",
      width: "100%",
   },
   contentWrapperClickable: {
      cursor: "pointer",
   },
   deleteIcon: {
      minWidth: "20px !important",
      minHeight: "20px !important",
      m: "16px 12px",
      cursor: "pointer",
      color: "neutral.500",
      "&:hover": {
         color: "neutral.800",
      },
   },
   linkSelectWrapper: {
      borderRadius: "8px",
      backgroundColor: (theme) => theme.brand.white[100],
      boxShadow: "0px 5px 15px 0px #BDBDBD",
      p: "16px 12px",
      mb: 2,
   },
   linkAddIcon: {
      color: (theme) => theme.brand.tq[600],
   },
   linkAddText: {
      color: (theme) => theme.brand.tq[600],
   },
   linkFormRoot: {
      borderRadius: "8px",
      backgroundColor: (theme) => theme.brand.white[100],
      boxShadow: "0px 5px 15px 0px #BDBDBD",
      p: "16px 12px",
      mb: 2,
   },
   linkTextField: {
      boxShadow: "0px 5px 15px 0px rgba(189, 189, 189, 0.40)",
      borderRadius: "8px",
      borderColor: "none",
      "& fieldset": { border: "none" },
   },
   linkFormCancelButton: {
      border: (theme) => `1px solid ${theme.palette.neutral[200]}`,
      p: "8px 16px",
      "&:hover": {
         borderColor: (theme) => theme.palette.neutral[50],
         backgroundColor: (theme) => theme.palette.neutral[50],
      },
   },
   linkFormAddButton: {
      p: "8px 16px",
      width: "82px",
      "&:hover": {
         backgroundColor: (theme) => theme.palette.primary[700],
      },
   },
})

const LINKEDIN_FIELD_NAME = "linkedInLink"
const REFERRAL_CODE_FIELD_NAME = "referralCode"

const SocialInformation = () => {
   const { authenticatedUser: currentUser, userData } = useAuth()
   const [existingReferralCode] = useLocalStorage(
      localStorageReferralCode,
      "",
      { raw: true }
   )
   const { talentProfileV1 } = useFeatureFlags()
   const [inputValues, setInputValues] = useState({
      [LINKEDIN_FIELD_NAME]: "",
      [REFERRAL_CODE_FIELD_NAME]: existingReferralCode,
   })
   const [isValidReferralCode, setIsValidReferralCode] = useState(false)

   // Warming up city related cloud functions (Used in LocationInformation)
   usePreFetchCityById(null)
   usePreFetchCitySearch("CH", "Zurich")

   const updateFields = useCallback(
      async (fieldToUpdate: Partial<UserData>) => {
         try {
            await userRepo.updateAdditionalInformation(
               currentUser.email,
               fieldToUpdate
            )
         } catch (error) {
            errorLogAndNotify(error, {
               message: "Error updating social information in SignUp",
            })
         }
      },
      [currentUser]
   )

   useEffect(() => {
      if (userData) {
         const { linkedinUrl, referredBy } = userData

         if (linkedinUrl) {
            setInputValues((prev) => {
               if (prev[LINKEDIN_FIELD_NAME] !== "") {
                  return prev
               }
               return {
                  ...prev,
                  [LINKEDIN_FIELD_NAME]: linkedinUrl || "",
               }
            })
         }

         if (referredBy) {
            setIsValidReferralCode(true)
            setInputValues((prev) => ({
               ...prev,
               [REFERRAL_CODE_FIELD_NAME]: referredBy.referralCode,
            }))
         }
      }
   }, [userData, inputValues])

   const handleInputChange = useCallback(({ target: { value, name } }) => {
      setInputValues((prev) => ({ ...prev, [name]: value }))
   }, [])

   return (
      <Grid
         container
         spacing={2}
         justifyContent="center"
         data-testid="registration-social-information-step"
      >
         <Grid item xs={12} sm={8}>
            <Typography sx={styles.inputLabel} variant="h5">
               Do you have a linkedin account?
            </Typography>
         </Grid>

         <Grid item xs={12} sm={8}>
            <ConditionalWrapper
               condition={talentProfileV1}
               fallback={
                  <LinkedInInput
                     name={LINKEDIN_FIELD_NAME}
                     linkedInValue={inputValues[LINKEDIN_FIELD_NAME]}
                     onUpdateField={updateFields}
                     onChange={handleInputChange}
                  />
               }
            >
               <UserLinkedInLink />
            </ConditionalWrapper>
         </Grid>
         <ConditionalWrapper condition={talentProfileV1}>
            <Grid item xs={12} sm={8}>
               <Typography sx={styles.inputLabel} variant="h5">
                  Any other links?
               </Typography>
            </Grid>
            <Grid item xs={12} sm={8}>
               <UserOtherLinks />
            </Grid>
         </ConditionalWrapper>
         <ConditionalWrapper condition={!talentProfileV1}>
            <Grid item xs={12} sm={8}>
               <Typography sx={styles.inputLabel} variant="h5">
                  Do you have a referral code?
               </Typography>
            </Grid>
            <Grid item xs={12} sm={8}>
               <ReferralCodeInput
                  name={REFERRAL_CODE_FIELD_NAME}
                  referralCodeValue={inputValues[REFERRAL_CODE_FIELD_NAME]}
                  onChange={handleInputChange}
                  isValid={isValidReferralCode}
                  onSetIsValid={setIsValidReferralCode}
               />
            </Grid>
         </ConditionalWrapper>
      </Grid>
   )
}

const UserLinkedInLink = () => {
   const { userData } = useAuth()
   const isMobile = useIsMobile()
   const isExtraSmall = useIsMobile(350)

   const [linkedInLink, setLinkedInLink] = useState(userData?.linkedinUrl || "")
   const [debouncedLink, setDebouncedLink] = useState(
      userData?.linkedinUrl || ""
   )

   useDebounce(
      () => {
         setDebouncedLink(linkedInLink)
      },
      1000,
      [linkedInLink]
   )

   useEffect(() => {
      setDebouncedLink(userData.linkedinUrl)
   }, [userData.linkedinUrl])

   const isLinkedInLinkValid =
      debouncedLink?.length > 0 && isValidLinkedInLink(debouncedLink)

   const normalizedLink =
      isLinkedInLinkValid && debouncedLink?.length > 0
         ? normalizeUrl(debouncedLink, { forceHttps: true })
         : null

   const faviconSrc = "/linkedin-favicon2.png"

   const link: ProfileLink = {
      title: "LinkedIn",
      url: debouncedLink,
      authId: userData.authId, // Not used in this case
      id: "linkedin", // Not used in this case
   }

   const linkUrlValue =
      isLinkedInLinkValid && debouncedLink?.length > 0
         ? normalizeUrl(
              getSubstringWithEllipsis(
                 debouncedLink,
                 isMobile ? (isExtraSmall ? 20 : 30) : 80
              ),
              { stripProtocol: true }
           )
         : null

   useEffect(() => {
      if (
         (debouncedLink?.length > 0 && !isValidLinkedInLink(debouncedLink)) ||
         userData?.linkedinUrl === debouncedLink
      ) {
         return
      }

      userRepo
         .updateAdditionalInformation(userData.id, {
            linkedinUrl: debouncedLink ?? null,
         })
         .catch((error) =>
            errorLogAndNotify(
               error,
               `Error updating LinkedIn URL for authId ${userData.authId}`
            )
         )
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [debouncedLink, userData.id, userData.authId])

   const handleDelete = useCallback(async () => {
      await userRepo.updateAdditionalInformation(userData.id, {
         linkedinUrl: "",
      })
      setLinkedInLink("")
   }, [userData.id])

   return (
      <ConditionalWrapper
         condition={isLinkedInLinkValid}
         fallback={
            <Stack>
               <TextField
                  className="registrationInput"
                  variant="outlined"
                  fullWidth
                  id={"talentProfileLinkedInLink"}
                  name={"talentProfileLinkedInLink"}
                  placeholder="Enter your LinkedIn link"
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) => setLinkedInLink(e.target.value)}
                  value={linkedInLink}
                  label="Add your LinkedIn link here"
               />
               <ConditionalWrapper
                  condition={debouncedLink?.length > 0 && !isLinkedInLinkValid}
               >
                  <FormHelperText sx={{ ml: 2, color: "error.main" }}>
                     Invalid LinkedIn link
                  </FormHelperText>
               </ConditionalWrapper>
            </Stack>
         }
      >
         <LinkCard
            normalizedLink={normalizedLink ?? ""}
            faviconSrc={faviconSrc}
            link={link}
            linkUrlValue={linkUrlValue}
            onDelete={handleDelete}
         />
      </ConditionalWrapper>
   )
}

const UserOtherLinks = () => {
   const { userData } = useAuth()
   const { data: userLinks } = useUserLinks()
   const isMobile = useIsMobile()
   const isExtraSmall = useIsMobile(350)

   const [isLinkFormOpen, setIsLinkFormOpen] = useState<boolean>(false)
   // Create a record of link ID to favicon source and link url value
   const linkData: Record<
      string,
      { faviconSrc: string; linkUrlValue: string }
   > = {}

   // Populate the linkData record for each link
   userLinks?.forEach((link) => {
      const normalizedLink = normalizeUrl(link.url, { forceHttps: true })

      const faviconSrc = isLinkedInUrl(normalizedLink)
         ? "/linkedin-favicon2.png"
         : getIconUrl(normalizedLink)

      const linkUrlValue = normalizeUrl(
         getSubstringWithEllipsis(
            link.url,
            isMobile ? (isExtraSmall ? 10 : 20) : 50
         ),
         { stripProtocol: true }
      )

      linkData[link.id] = {
         faviconSrc,
         linkUrlValue,
      }
   })

   const handleLinkSubmit = useCallback(
      async (link: ProfileLink) => {
         if (!userData.linkedinUrl && isLinkedInUrl(link.url)) {
            await userRepo
               .updateAdditionalInformation(userData.id, {
                  linkedinUrl: link.url,
               })
               .catch(errorLogAndNotify)
         } else {
            await userRepo
               .createUserLink(userData.id, link)
               .catch(errorLogAndNotify)
         }
      },
      [userData.linkedinUrl, userData.id]
   )

   const handleLinkDelete = useCallback(
      async (linkId: string) => {
         await userRepo.deleteLink(userData.id, linkId).catch(errorLogAndNotify)
      },
      [userData.id]
   )

   return (
      <Stack spacing={1.5}>
         {userLinks?.map((link) => (
            <LinkCard
               key={link.id}
               normalizedLink={link.url}
               faviconSrc={linkData[link.id].faviconSrc}
               link={link}
               linkUrlValue={linkData[link.id].linkUrlValue}
               onDelete={() => handleLinkDelete(link.id)}
            />
         ))}

         <ConditionalWrapper
            condition={!isLinkFormOpen}
            fallback={
               <LinkForm
                  onCancel={() => setIsLinkFormOpen(false)}
                  onSubmit={handleLinkSubmit}
               />
            }
         >
            <Stack
               sx={[styles.linkSelectWrapper, { cursor: "pointer" }]}
               direction="row"
               alignItems="center"
               justifyContent="center"
               spacing={1}
               onClick={() => setIsLinkFormOpen(true)}
            >
               <Box component={PlusCircle} size={16} sx={styles.linkAddIcon} />
               <Typography variant="small" sx={styles.linkAddText}>
                  Add custom link
               </Typography>
            </Stack>
         </ConditionalWrapper>
      </Stack>
   )
}

type LinkFormProps = {
   onCancel: () => void
   onSubmit: (link: ProfileLink) => Promise<void>
}
const LinkForm = ({ onCancel, onSubmit }: LinkFormProps) => {
   const { userData } = useAuth()
   const [linkTitle, setLinkTitle] = useState("")
   const [link, setLink] = useState("")

   const resetForm = () => {
      setLinkTitle("")
      setLink("")
   }

   const handleSave = async () => {
      resetForm()
      onSubmit({
         title: linkTitle,
         url: normalizeUrl(link, { forceHttps: true }),
         authId: userData.authId,
         id: null,
      })
      onCancel()
   }

   const handleCancel = useCallback(() => {
      resetForm()
      onCancel()
   }, [onCancel])

   const isValidLink = useMemo(() => {
      return isWebUri(link)
   }, [link])

   const isValidForm = useMemo(() => {
      return isValidLink && Boolean(linkTitle?.length)
   }, [isValidLink, linkTitle])

   return (
      <Stack sx={styles.linkFormRoot} spacing={2}>
         <Stack spacing={1.5}>
            <TextField
               label="Add your link title"
               name="linkTitle"
               value={linkTitle}
               onChange={(e) => setLinkTitle(e.target.value)}
               sx={styles.linkTextField}
               fullWidth
               variant="outlined"
            />
            <Stack justifyContent={"flex-start"}>
               <TextField
                  label="Add your link URL"
                  name="linkUrl"
                  value={link}
                  onChange={(e) => {
                     setLink(e.target.value)
                  }}
                  sx={styles.linkTextField}
                  fullWidth
                  variant="outlined"
               />
               <ConditionalWrapper condition={link?.length > 0 && !isValidLink}>
                  <FormHelperText sx={{ ml: 2, color: "error.main" }}>
                     Invalid UrL
                  </FormHelperText>
               </ConditionalWrapper>
            </Stack>
         </Stack>
         <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
               sx={styles.linkFormCancelButton}
               variant="outlined"
               onClick={handleCancel}
            >
               <Typography variant="small" fontWeight={400} color="neutral.500">
                  Cancel
               </Typography>
            </Button>
            <Button
               sx={styles.linkFormAddButton}
               variant="contained"
               onClick={handleSave}
               disabled={!isValidForm}
            >
               <Typography variant="small" fontWeight={400} color="white.100">
                  Add
               </Typography>
            </Button>
         </Stack>
      </Stack>
   )
}

type LinkCardProps = {
   normalizedLink: string
   faviconSrc: string
   link: ProfileLink
   linkUrlValue: string
   onDelete: () => void
}

const LinkCard = ({
   normalizedLink,
   faviconSrc,
   link,
   linkUrlValue,
   onDelete,
}: LinkCardProps) => {
   return (
      <Stack
         direction={"row"}
         justifyContent={"space-between"}
         sx={styles.linkCardRoot}
      >
         <Stack
            direction={"row"}
            spacing={1.5}
            sx={[styles.contentWrapper, styles.contentWrapperClickable]}
         >
            <CustomLinkCard
               normalizedLink={normalizedLink}
               faviconSrc={faviconSrc}
               link={link}
               linkUrlValue={linkUrlValue}
            />
         </Stack>

         <Box onClick={onDelete} component={Trash2} sx={styles.deleteIcon} />
      </Stack>
   )
}

const isValidLinkedInLink = (link: string): boolean => {
   return linkedInRegex.test(link)
}

export default SocialInformation
