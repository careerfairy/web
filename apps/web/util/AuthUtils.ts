/**
 * Paths that require sign in
 */
const securePaths = [
   "/profile",
   "/groups",
   "/group/[groupId]/admin",
   "/group/[groupId]/admin/page/[[...livestreamDialog]]",
   "/group/[groupId]/admin/past-livestreams",
   "/group/[groupId]/admin/upcoming-livestreams",
   "/group/[groupId]/admin/drafts",
   "/group/[groupId]/admin/events",
   "/group/[groupId]/admin/events/all/[[...livestreamDialog]]",
   "/group/[groupId]/admin/roles",
   "/group/[groupId]/admin/edit",
   "/group/[groupId]/admin/analytics",
   "/group/[groupId]/admin/analytics/talent-pool",
   "/group/[groupId]/admin/analytics/live-stream",
   "/group/[groupId]/admin/analytics/live-stream/[[...livestreamId]]",
   "/group/[groupId]/admin/analytics/feedback/[[...feedback]]",
   "/group/[groupId]/admin/analytics/registration-sources",
   "/group/[groupId]/admin/ats-integration",
   "/new-livestream",
   "/group/create",
   "/next-livestreams/my-registrations",
   "/past-livestreams/unlocked-content",
]

const adminPaths = ["/group/create", "/new-livestream"]

const signupPaths = ["/signup"]

export const isSecurePath = (pathname: string) => {
   return Boolean(securePaths.includes(pathname))
}

export const isAdminPath = (pathname: string) => {
   return Boolean(adminPaths.includes(pathname))
}

export const isSignupPath = (pathname: string) => {
   return Boolean(signupPaths.includes(pathname))
}
