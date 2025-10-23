export function Greeting({ timeOfDay }) {
  return timeOfDay === "morning" ? (
    <p>Good morning!</p>
  ) : timeOfDay === "afternoon" ? (
    <p>Good afternoon!</p>
  ) : (
    <p>Good evening!</p>
  );
}
