function addLeadingZero(number) {
  const strNumber = `${number}`;
  return strNumber.length === 1 ? `0${strNumber}` : strNumber;
}

export function generateTimeKeys({ hours = 24, minutes = 60 } = {}) {
  const keys = [];

  for(let hour = 0; hour < hours; hour++) {
    for (let minute = 0; minute < minutes; minute++) {
      keys.push(addLeadingZero(hour) + addLeadingZero(minute));
    }
  }

  return keys;
}
