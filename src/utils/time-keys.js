function addLeadingZero(number) {
  const strNumber = `${number}`;
  return strNumber.length === 1 ? `0${strNumber}` : strNumber;
}

function generateTimeKeys() {
  const keys = [];

  for(let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute++) {
      keys.push(addLeadingZero(hour) + addLeadingZero(minute));
    }
  }

  return keys;
}

export default generateTimeKeys();
