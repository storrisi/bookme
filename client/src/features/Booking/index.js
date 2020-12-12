import React from "react"
import { useParams } from "react-router-dom"
import "react-dates/initialize"
import { DayPickerSingleDateController } from "react-dates"
import moment from "moment"
import Event from "../../utils/EventClass"
import "react-dates/lib/css/_datepicker.css"

export default function Booking() {
  const { userId, eventUrl } = useParams()
  const [event, setEvent] = React.useState({})
  const [availableDays, setAvailableDays] = React.useState([])
  const [slots, setSlots] = React.useState({})
  const [daySlots, setDaySlots] = React.useState([])

  console.log(userId, eventUrl)

  React.useEffect(() => {
    Event.get(userId, eventUrl).then((res) => {
      setEvent(res)
      console.log(res)
      setAvailableDays(Event.getAvailableDays(res.availabilities))
      setSlots(Event.getSlots(res))
    })
  }, [userId, eventUrl])

  console.log(event)

  const isBlockedDay = (day) => availableDays.indexOf(day.format("dddd")) === -1
  const isHighlightedDay = (day) => availableDays.indexOf(day.format("dddd")) > -1
  const onDateChange = (date) => {
    setDaySlots(slots[date.day()])
  }

  return (
    <div>
      <DayPickerSingleDateController
        onOutsideClick={() => {}}
        onPrevMonthClick={() => {}}
        onNextMonthClick={() => {}}
        numberOfMonths={1}
        isDayBlocked={isBlockedDay}
        isDayHighlighted={isHighlightedDay}
        onDateChange={onDateChange}
      />
      <div>
        {daySlots.map((slot) => (
          <div>{`${slot.format("HH:mm")}`}</div>
        ))}
      </div>
    </div>
  )
}
