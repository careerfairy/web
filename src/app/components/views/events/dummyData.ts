import { LiveStreamEvent } from "../../../tempTypes/event";

const logo =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/highlights%2Flogos%2Fdownload%201.png?alt=media&token=a435b542-b1df-4f46-8159-42d5f31c6b8e";
const demoMan =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/speaker-video%2Fvideoblocks-confident-male-coach-lector-recording-educational-video-lecture_r_gjux7cu_1080__D.mp4?alt=media";
const thumbnail =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/highlights%2Fthumbnails%2FWoman-on-a-video-conference-call-1%201.png?alt=media&token=6f34d092-70fb-41fc-85bd-b2708390021c";
const numData = 20;

const highlightDoc = {
   videoUrl: demoMan,
   thumbnail: thumbnail,
   logo: logo,
};
export const dummyHighlights = Array(numData).fill(highlightDoc);

export const dummyEvent: LiveStreamEvent = {
   title: "Modern way of software craftmanship",
   language: { code: "en", name: "English" },
   startDate: new Date(),
   id: "1231",
   groupIds: ["GXW3MtpTehSmAe0aP1J4", "rjotrGrg47t38iwC9KfE"],
   interestsIds: [
      "MPY3KTjYH1GiePa4I0kZ",
      "pyfkBYzhJ3ewnmGAoz1l",
      "zzBbeQvTajFdx10kz6X0",
   ],
   summary:
      "We live in a world that changes constantly. Things that were completely fine several ... We live in a world that changes constantly. Things that were completely fine several",
   backgroundImageUrl:
      "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2Fdemo-thumbnail.png?alt=media&token=5642cd91-a2f5-4e07-856e-6db2ba8f51b7",
   companyLogoUrl:
      "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Fa68ee229-ca64-4044-9e84-2a3e7ef576d2_47x280%201.png?alt=media&token=12619334-4341-43f5-827d-693003e70751",
};

const existingInterests = [
   { id: "MPY3KTjYH1GiePa4I0kZ", name: "R&D" },
   { id: "OjIkyLu7oxICHqweTT04", name: "Cinema" },
   { id: "bcs4xerUoed6G28AVjSZ", name: "Business" },
   { id: "pyfkBYzhJ3ewnmGAoz1l", name: "Computer Science" },
   { id: "zzBbeQvTajFdx10kz6X0", name: "Product Management" },
];
