import firebase from "./firebase"

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
}
