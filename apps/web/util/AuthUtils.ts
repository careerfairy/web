/**
 * Paths that require sign in
 */
const securePaths = [
   "/profile",
   "/groups",
   "/group/[groupId]/admin",
   "/group/[groupId]/admin/page",
   "/group/[groupId]/admin/page/[[...livestreamDialog]]",
   "/group/[groupId]/admin/past-livestreams",
   "/group/[groupId]/admin/upcoming-livestreams",
   "/group/[groupId]/admin/drafts",
   "/group/[groupId]/admin/content/live-streams",
   "/group/[groupId]/admin/content/live-streams/[livestreamId]",
   "/group/[groupId]/admin/content/sparks",
   "/group/[groupId]/admin/roles",
   "/group/[groupId]/admin/edit",
   "/group/[groupId]/admin/talent-pool",
   "/group/[groupId]/admin/analytics",
   "/group/[groupId]/admin/analytics/live-streams",
   "/group/[groupId]/admin/analytics/live-streams/[[...livestreamId]]",
   "/group/[groupId]/admin/analytics/live-streams/feedback/[[...feedback]]",
   "/group/[groupId]/admin/analytics/live-streams/registration-sources",
   "/group/[groupId]/admin/analytics/sparks",
   "/group/[groupId]/admin/ats-integration",
   "/group/[groupId]/admin/profile",
   "/group/[groupId]/admin/jobs",
   "/group/[groupId]/admin/jobs/[[...jobId]]",
   "/group/[groupId]/admin/livestream",
   "/group/[groupId]/admin/livestream/[[...livestreamId]]",
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
