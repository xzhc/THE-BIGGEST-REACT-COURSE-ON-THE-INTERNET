import { useState } from "react";

export function Profile() {
  const [profile, setProfile] = useState({
    name: "xzh",
    age: 26,
  });

  return (
    <div>
      <h2>Profile</h2>

      <label>
        Name:
        <input
          type="text"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
        />
      </label>

      <label>
        Age:
        <input
          type="number"
          value={profile.age}
          onChange={(e) => setProfile({ ...profile, age: e.target.value })}
        />
      </label>

      <p>name:{profile.name}</p>
      <p>age: {profile.age}</p>
    </div>
  );
}
