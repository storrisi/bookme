import firebase from "./firebase"
import moment from "moment"

export default class Booking {
  static save(event, userId) {
    const bookingsRef = firebase.database().ref("bookings")
    var userBookingsRef = bookingsRef.child(userId)

    var newPostRef = userBookingsRef.push()
    return new Promise((resolve, reject) => {
      newPostRef.set(event, (error) => {
        if (error) {
          console.error(error)
          reject(false)
        } else {
          resolve(true)
        }
      })
    })
  }

  static async get(userId) {
    const eventsRef = firebase.database().ref("bookings")
    const userEventsRef = eventsRef.child(userId)

    const snapshot = await userEventsRef.orderByChild("date").startAt(moment().valueOf()).once("value")

    const queryResult = snapshot.val()

    if (!queryResult) return false

    const trip = Object.values(queryResult).map((event) => {
      return { ...event, date: moment(event.date) }
    })
    return trip
  }
}
