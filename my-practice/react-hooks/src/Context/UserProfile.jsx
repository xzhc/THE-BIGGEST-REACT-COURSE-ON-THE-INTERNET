import { useContext } from "react";
import { UserContext } from "./UserContext.jsX";

export const UserProfile = () => {
  const { user } = useContext(UserContext);

  return (
    <div>
      <h1>User Profile</h1>
      <p>{user.name}</p>
    </div>
  );
};
