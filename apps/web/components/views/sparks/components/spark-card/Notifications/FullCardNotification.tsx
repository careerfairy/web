import { useSelector } from "react-redux"
import { cardNotificationSelector } from "store/selectors/sparksFeedSelectors"
import SparkEventFullCardNotification from "./SparkEventFullCardNotification"
import SparkGroupFullCardNotification from "./SparkGroupFullCardNotification"
import {
   SparkCardNotificationTypes,
   SparkPresenter,
} from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { FC } from "react"
import SparkConversionFullCardNotification from "./SparkConversionFullCardNotification"

type Props = {
   spark: SparkPresenter
}

const FullCardNotification: FC<Props> = ({ spark }) => {
   const cardNotification = useSelector(cardNotificationSelector)

   switch (spark.cardNotificationType) {
      case SparkCardNotificationTypes.CONVERSION:
         return <SparkConversionFullCardNotification />

      case SparkCardNotificationTypes.EVENT:
         return (
            <SparkEventFullCardNotification
               eventId={cardNotification.eventId}
            />
         )

      case SparkCardNotificationTypes.GROUP:
         return <SparkGroupFullCardNotification group={spark.group} />
   }
}

export default FullCardNotification
