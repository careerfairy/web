import { OfflineEvent } from "@careerfairy/shared-lib/offline-events/offline-events"
import { Box, Typography } from "@mui/material"
import { ContentCarousel } from "components/views/common/carousels/ContentCarousel"
import { Timestamp } from "data/firebase/FirebaseInstance"
import { sxStyles } from "types/commonTypes"
import { OfflineEventCard } from "./OfflineEventCard"

const styles = sxStyles({
   root: {
      pl: { xs: 2, md: 2 },
      pb: { xs: 3, md: 3 },
      width: "100%",
   },
   carouselContainer: {
      position: "static",
   },
   headerRight: {
      pr: 2,
   },
})

const logoUrl =
   "http://localhost:3000/_next/image?url=https%3A%2F%2Ffirebasestorage.googleapis.com%2Fv0%2Fb%2Fcareerfairy-e1fd9.appspot.com%2Fo%2Fgroups%252F1dGZnHVaeYaz1KuLHvei%252Flogos%252Fc3d3a918-27ab-4c33-90ae-4040aeefb7f7.png%3Falt%3Dmedia%26token%3D9b4726c4-02d2-49e8-aaaf-64531130a38b&w=96&q=70"

const dummyEvents: OfflineEvent[] = [
   {
      id: "offline-1",
      backgroundImageUrl: "/mockup/livestream.png",
      author: {
         groupId: "1",
         authUid: "dummy-user-1",
      },
      title: "Virtual Case Experience",
      description: `
         <section>
            <h2>Join us for an interactive virtual case study experience</h2>
            <p>
               Work on real business challenges in a collaborative environment. This event is designed to help you develop practical skills and connect with industry professionals.
            </p>
            <p>
               <strong>Lorem ipsum dolor sit amet</strong>, consectetur adipiscing elit. Pellentesque euismod, urna eu tincidunt consectetur, nisi nisl aliquam enim, nec facilisis massa mauris ac dolor. 
            </p>
            <ul>
               <li>Hands-on case studies</li>
               <li>Networking opportunities</li>
               <li>Expert feedback sessions</li>
            </ul>
            <p>
               Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Integer ac sem nec urna cursus faucibus. 
            </p>
         </section>
      `,
      address: {
         countryISOCode: {
            id: "CH",
            name: "Switzerland",
         },
         cityISOCode: {
            id: "St.Gallen",
            name: "St.Gallen",
         },
         street: "Hardturmstrasse, 9004",
      },
      company: {
         name: "Pwc",
         groupId: "078cXeWXrCaXLaUP2ljv",
         logoUrl,
      },
      industries: [
         { id: "consulting", name: "Consulting" },
         { id: "finance", name: "Finance" },
      ],
      targetAudience: {
         universities: [],
         levelOfStudies: [],
         fieldOfStudies: [],
      },
      status: "upcoming",
      registrationUrl: "https://example.com/register/offline-1",
      startAt: new Timestamp(0, 0),
      createdAt: new Timestamp(0, 0),
      updatedAt: new Timestamp(0, 0),
      lastUpdatedBy: {
         groupId: "1",
         authUid: "dummy-user-1",
      },
   },
   {
      id: "offline-2",
      backgroundImageUrl: "/mockup/engagement.jpg",
      author: {
         groupId: "2",
         authUid: "dummy-user-2",
      },
      title: "Graduate Networking Night",
      description:
         "Connect with industry professionals and fellow graduates at our exclusive networking event.",
      address: {
         countryISOCode: {
            id: "CH",
            name: "Switzerland",
         },
         cityISOCode: {
            id: "Zurich",
            name: "Zurich",
         },
         street: "Hardturmstrasse, 9004",
      },
      company: {
         name: "Nestlé",
         groupId: "2",
         logoUrl,
      },
      industries: [
         { id: "food-beverage", name: "Food & Beverage" },
         { id: "consumer-goods", name: "Consumer Goods" },
      ],
      targetAudience: {
         universities: [],
         levelOfStudies: [],
         fieldOfStudies: [],
      },
      status: "upcoming",
      registrationUrl: "https://example.com/register/offline-2",
      startAt: new Timestamp(0, 0),
      createdAt: new Timestamp(0, 0),
      updatedAt: new Timestamp(0, 0),
      lastUpdatedBy: {
         groupId: "2",
         authUid: "dummy-user-2",
      },
   },
   {
      id: "offline-3",
      backgroundImageUrl: "/sidebar.jpg",
      author: {
         groupId: "3",
         authUid: "dummy-user-3",
      },
      title: "Meet the Team: Tech Open Day",
      description:
         "Explore our technology division and meet the team behind our innovative solutions.",
      address: {
         countryISOCode: {
            id: "CH",
            name: "Switzerland",
         },
         cityISOCode: {
            id: "Basel",
            name: "Basel",
         },
         street: "Max-Daetwyler-Platz, 2",
      },
      company: {
         name: "UBS",
         groupId: "3",
         logoUrl,
      },
      industries: [
         { id: "banking", name: "Banking" },
         { id: "technology", name: "Technology" },
      ],
      targetAudience: {
         universities: [],
         levelOfStudies: [],
         fieldOfStudies: [],
      },
      status: "upcoming",
      registrationUrl: "https://example.com/register/offline-3",
      startAt: new Timestamp(0, 0),
      createdAt: new Timestamp(0, 0),
      updatedAt: new Timestamp(0, 0),
      lastUpdatedBy: {
         groupId: "3",
         authUid: "dummy-user-3",
      },
   },
]

export const OfflineEvents = () => {
   return (
      <Box sx={styles.root}>
         <ContentCarousel
            slideWidth={317}
            headerTitle={
               <Typography variant="brandedH4" fontWeight={600}>
                  Events near you
               </Typography>
            }
            containerSx={styles.carouselContainer}
            headerRightSx={styles.headerRight}
            disableArrows={false}
         >
            {[...dummyEvents, ...dummyEvents, ...dummyEvents].map(
               (event, index) => (
                  <OfflineEventCard event={event} key={event.id + index} />
               )
            )}
         </ContentCarousel>
      </Box>
   )
}
