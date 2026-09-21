// @ts-ignore
// `asOf` defaults to now, but reports pass the record's date so a printed age is
// the age at collection and a reprint years later says the same thing.
export function calculateAge(dateString, asOf = new Date()) {
  const birthDate = new Date(dateString);
  // guard falsy separately: new Date(null) is the 1970 epoch, not an invalid date
  let currentDate = asOf ? new Date(asOf) : new Date();
  if (isNaN(currentDate.getTime())) currentDate = new Date();
  let age = currentDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = currentDate.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

