export function urlValidation(text) {
  var regexp = /^[a-z0-9-_]+$/
  if (text.search(regexp) === -1) return false
  return true
}
