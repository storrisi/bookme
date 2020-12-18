import React from "react"
import { useParams } from "react-router-dom"
import "react-dates/initialize"
import { Grid } from "@material-ui/core"
import { DayPickerSingleDateController } from "react-dates"
import moment from "moment"
import uniq from "lodash/uniq"
import Event from "../../utils/EventClass"
import "react-dates/lib/css/_datepicker.css"
import { useGoogleApi } from "../../utils/GoogleApis"
import style from "./style.module.css"

export default function Booking() {
  const { userId, eventUrl } = useParams()
  const [event, setEvent] = React.useState({})
  const [availableDays, setAvailableDays] = React.useState([])
  const [slots, setSlots] = React.useState({})
  const [daySlots, setDaySlots] = React.useState([])
  const [busyEvents, setBusyEvents] = React.useState([])
  const [selectedSlot, setSelectedSlot] = React.useState(null)

  React.useEffect(() => {
    Event.get(userId, eventUrl).then((res) => {
      setEvent(res)
      console.log(res)
      setAvailableDays(Event.getAvailableDays(res.availabilities))
      setSlots(Event.getSlots(res))
    })
  }, [userId, eventUrl])

  React.useEffect(() => {
    async function fetchData() {
      const calendars = event.calendars.map((calendar) => {
        return { id: calendar.id }
      })

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/freeBusy?key=${process.env.REACT_APP_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
          body: JSON.stringify({
            timeMin: moment(),
            timeMax: moment().add("3", "month"),
            items: calendars,
          }),
        }
      )

      const result = await response.json()
      const busyEvents = Object.keys(result.calendars).reduce((previousValue, currentValue) => {
        const calendar = result.calendars[currentValue]
        return previousValue.concat(previousValue, calendar.busy)
      }, [])

      setBusyEvents(busyEvents)
    }
    if (Object.keys(event).length > 0) fetchData()
  }, [event])

  const isBlockedDay = (day) => day.isBefore(moment(), "day") || availableDays.indexOf(day.format("dddd")) === -1
  const isHighlightedDay = (day) => day.isSameOrAfter(moment(), "day") && availableDays.indexOf(day.format("dddd")) > -1
  const onDateChange = (date) => {
    setSelectedSlot(null)
    const availableSlots = slots[date.day()]
    const sameDayEvents = uniq(
      busyEvents.filter((busyEvent) => date.isBetween(busyEvent.start, busyEvent.end, "day", "[]"))
    )

    setDaySlots(
      availableSlots.filter(
        (slot) =>
          date.hour(slot.hour()).isSameOrAfter() &&
          sameDayEvents.filter(
            (sameDay) => slot.hour() >= moment(sameDay.start).hour() && slot.hour() <= moment(sameDay.end).hour()
          ).length === 0
      )
    )
  }

  return (
    <Grid container direction="row" justify="center" alignItems="start">
      <Grid item>
        <DayPickerSingleDateController
          onOutsideClick={() => {}}
          onPrevMonthClick={() => {}}
          onNextMonthClick={() => {}}
          numberOfMonths={1}
          isDayBlocked={isBlockedDay}
          isDayHighlighted={isHighlightedDay}
          onDateChange={onDateChange}
        />
      </Grid>
      <Grid item>
        {daySlots.map((slot) => (
          <div
            className={`${style.slot} ${selectedSlot === slot && style.selected}`}
            key={`${slot.format("HH:mm")}`}
            onClick={() => setSelectedSlot(slot)}
          >{`${slot.format("HH:mm")}`}</div>
        ))}
      </Grid>
    </Grid>
  )
}
