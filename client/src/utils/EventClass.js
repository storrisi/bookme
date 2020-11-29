export default class Event {
  static EMPTY_VALUE = "EMPTY_VALUE"
  static EMPTY_DAY = "EMPTY_DAY"
  static EMPTY_STARTING_HOUR = "EMPTY_STARTING_HOUR"
  static EMPTY_ENDING_HOUR = "EMPTY_ENDING_HOUR"
  static START_GREATER_THAN_END = "START_GREATER_THAN_END"
  static END_LOWER_THAN_START = "END_LOWER_THAN_START"

  static validate({ eventName, slots }) {
    const errors = {}
    if (eventName === "") errors.eventName = false
    slots.forEach((slot, index) => {
      const res = this.validateSlot(slot)
      if (res !== true) errors.slots = { ...errors.slots, [index]: res }
    })

    return errors
  }

  static validateSlot(event) {
    if (event.day === "" && event.startingHour === "" && event.endingHour === "") return this.EMPTY_VALUE
    if (event.day === "") return this.EMPTY_DAY
    if (event.startingHour === "") return this.EMPTY_STARTING_HOUR
    if (event.endingHour === "") return this.EMPTY_ENDING_HOUR
    if (event.startingHour >= event.endingHour) return this.START_GREATER_THAN_END
    if (event.endingHour <= event.startingHour) return this.END_LOWER_THAN_START
    return true
  }
}
