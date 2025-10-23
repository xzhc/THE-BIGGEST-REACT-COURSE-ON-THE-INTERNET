export function Weather({ temperature }) {
  if (temperature < 15) {
    return <p>It's cold outside!</p>;
  } else if (15 <= temperature && temperature <= 25) {
    return <p>It's nice outside!</p>;
  } else {
    return <p>It's hot outside!</p>;
  }
}
