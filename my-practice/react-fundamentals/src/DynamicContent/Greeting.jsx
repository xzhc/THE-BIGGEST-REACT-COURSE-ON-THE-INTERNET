function Greeting() {
  const welcomeMessage = "Welcome to my house!";
  const date = "22-10-2025";
  const name = "John";

  const currentDate = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <div>
      <h1>{welcomeMessage}</h1>
      <p>Today is {date}</p>
      <p>This guy's name is {name}</p>
      <p>The current date: {currentDate}</p>
    </div>
  );
}

export default Greeting;
