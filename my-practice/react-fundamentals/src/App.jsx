import { Greeting } from "./ConditionalRendering/Greeting";
import { UserStatus } from "./ConditionalRendering/UserStatus";
import { Weather } from "./ConditionalRendering/Weather";

const App = () => {
  return (
    <div>
      <h1>Conditional Rendering in React</h1>
      <Weather temperature={10} />
      <Weather temperature={20} />
      <Weather temperature={30} />

      <UserStatus loggedIn={true} isAdmin={true} />
      <UserStatus loggedIn={true} isAdmin={false} />

      <UserStatus loggedIn={false} />

      <Greeting timeOfDay="morning" />
      <Greeting timeOfDay="afternoon" />
      <Greeting timeOfDay="evening" />
    </div>
  );
};

export default App;
