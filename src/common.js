export function getRandomInt(max) { return Math.floor(Math.random() * max); }
export function isToday(someDate) {
  const today = new Date()
  someDate = new Date(someDate);
  return someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear()
}
