/**
 * Customer.io transactional message IDs
 */
export const CUSTOMERIO_MESSAGE_IDS = {
   LIVESTREAM_START: {
      id: process.env.CUSTOMERIO_LIVESTREAM_START_MESSAGE_ID,
      type: "LIVESTREAM_START",
   },
} as const satisfies Record<string, { id: string; type: string }>
