import React from "react"
import { useParams } from "react-router-dom"
import "react-dates/initialize"
import { Button, Grid, makeStyles, TextField } from "@material-ui/core"
import { DayPickerSingleDateController } from "react-dates"
import moment from "moment"
import uniq from "lodash/uniq"
import Event from "../../utils/EventClass"
import BookingClass from "../../utils/BookingClass"
import "react-dates/lib/css/_datepicker.css"
import { useGoogleApi } from "../../utils/GoogleApis"
import style from "./style.module.css"

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  button: {
    marginTop: theme.spacing(2),
  },
}))

export default function Booking() {
  const classes = useStyles()
  const { userId, eventUrl } = useParams()
  const [event, setEvent] = React.useState({})
  const [bookings, setBookings] = React.useState([])
  const [availableDays, setAvailableDays] = React.useState([])
  const [slots, setSlots] = React.useState({})
  const [daySlots, setDaySlots] = React.useState([])
  const [busyEvents, setBusyEvents] = React.useState([])
  const [selectedSlot, setSelectedSlot] = React.useState(null)
  const [selectedDate, setSelectedDate] = React.useState(null)
  const [details, setDetails] = React.useState({ name: "", email: "", message: "" })

  React.useEffect(() => {
    const eventAndBooking = [
      Event.get(userId, eventUrl).then((res) => {
        setEvent(res)
        return res
      }),

      BookingClass.get(userId).then((res) => {
        setBookings(res)
        return res
      }),
    ]

    Promise.all(eventAndBooking).then((res) => {
      setAvailableDays(Event.getAvailableDays(res[0]))
      setSlots(Event.getSlots(res[0]))
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

  const isBlockedDay = (day) =>
    day.isBefore(moment(), "day") ||
    availableDays.indexOf(day.format("dddd")) === -1 ||
    Event.isBlockedDay(event, bookings, day)
  const isHighlightedDay = (day) => day.isSameOrAfter(moment(), "day") && availableDays.indexOf(day.format("dddd")) > -1
  const onDateChange = (date) => {
    setSelectedDate(date)
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

  const changeDetails = (id, value) =>
    setDetails((previousState) => {
      return { ...previousState, [id]: value }
    })

  const onSave = () => {
    BookingClass.save(
      {
        ...details,
        date: selectedDate.hour(selectedSlot.hour()).minutes(selectedSlot.minutes()).valueOf(),
      },
      userId
    ).then(() => {
      setDetails({ name: "", email: "", message: "" })
      setSelectedSlot(null)
      setSelectedDate(null)
    })
  }

  return (
    <div>
      <Grid container direction="row" justify="center" alignItems="start">
        <Grid item>
          <Grid className={classes.root} spacing={4} container direction="column" justify="center" alignItems="center">
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
            {selectedSlot && (
              <>
                <Grid item>
                  <TextField
                    className={classes.slider}
                    placeholder="Name and Surname"
                    value={details.name}
                    onChange={(event) => changeDetails("name", event.target.value)}
                  />
                </Grid>
                <Grid item>
                  <TextField
                    className={classes.slider}
                    placeholder="Email"
                    value={details.email}
                    onChange={(event) => changeDetails("email", event.target.value)}
                  />
                </Grid>
                <Grid item>
                  <TextField
                    className={classes.slider}
                    placeholder="Message"
                    value={details.message}
                    onChange={(event) => changeDetails("message", event.target.value)}
                  />
                </Grid>
                <Button variant="contained" color="primary" className={classes.saveButton} onClick={onSave}>
                  Save Event
                </Button>
              </>
            )}
          </Grid>
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
    </div>
  )
}
