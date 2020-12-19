import React, { useState, useEffect } from "react"
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
  const [event, setEvent] = useState({})
  const [bookings, setBookings] = useState([])
  const [availableDays, setAvailableDays] = useState([])
  const [slots, setSlots] = useState({})
  const [daySlots, setDaySlots] = useState([])
  const [busyEvents, setBusyEvents] = useState([])
  const [userEvents, setUserEvents] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [details, setDetails] = useState({ name: "", email: "", message: "" })
  const { signOut, isAuthenticated, isClientLoaded, getCalendarList, getCalendarFreeBusySlots } = useGoogleApi(
    process.env.REACT_APP_CLIENT_ID,
    process.env.REACT_APP_API_KEY
  )

  useEffect(() => {
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

  useEffect(() => {
    if (Object.keys(event).length > 0) getCalendarFreeBusySlots(event.calendars).then((res) => setBusyEvents(res))
  }, [event])

  useEffect(() => {
    isAuthenticated &&
      isClientLoaded &&
      getCalendarList().then((res) => {
        if (res.error) return
        getCalendarFreeBusySlots(res).then((res) => setUserEvents(res))
      })
  }, [isClientLoaded, isAuthenticated])

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
    ).concat(uniq(userEvents.filter((userEvent) => date.isBetween(userEvent.start, userEvent.end, "day", "[]"))))

    setDaySlots(
      availableSlots.filter(
        (slot) =>
          date.hour(slot.hour()).isSameOrAfter() &&
          sameDayEvents.filter((sameDay) => {
            return Event.isBusySlot(slot, date, event.duration, sameDay)
          }).length === 0 &&
          bookings &&
          bookings.filter((booking) => {
            return Event.isBusySlot(slot, date, event.duration, { start: booking.date, end: booking.dateEnd })
          }).length === 0
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
        dateEnd: selectedDate
          .hour(selectedSlot.hour())
          .minutes(selectedSlot.minutes())
          .add(event.duration, "minutes")
          .valueOf(),
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
      <h1>Find the perfect Slot matching your availabilities with the User's ones.</h1>
      <h2>You need to give access to your Google Calendar in order to retrieve your availabilities</h2>
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
            <Button variant="contained" color="primary" className={classes.saveButton} onClick={signOut}>
              Sign Out
            </Button>
          </Grid>
        </Grid>
        <Grid item>
          {selectedDate && <Grid item>{selectedDate.format("dddd DD MMMM YYYY")}</Grid>}
          {daySlots && daySlots.length > 0 ? (
            daySlots.map((slot) => (
              <div
                className={`${style.slot} ${selectedSlot === slot && style.selected}`}
                key={`${slot.format("HH:mm")}`}
                onClick={() => setSelectedSlot(slot)}
              >{`${slot.format("HH:mm")}`}</div>
            ))
          ) : (
            <div>No Slots available</div>
          )}
        </Grid>
      </Grid>
    </div>
  )
}
