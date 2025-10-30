import { UpdateUser } from "./Context/UpdateUser";
import { UserProvider } from "./Context/UserContext.jsX";
import { UserProfile } from "./Context/UserProfile";
import { BasicEffect } from "./useEffect/BasicEffect";
import { CounterEffect } from "./useEffect/CounterEffect";
import { FetchDataEffect } from "./useEffect/FetchDataEffect";

function App() {
  return (
    <>
      {/* <BasicEffect /> */}
      {/* <CounterEffect /> */}
      {/* <FetchDataEffect /> */}
      <UserProvider>
        <UserProfile />
        <UpdateUser />
      </UserProvider>
    </>
  );
}

export default App;
