function UserList() {
  const users = [
    { id: 1, name: "Alice", age: 25 },
    { id: 2, name: "Bob", age: 30 },
    { id: 3, name: "Charlie", age: 22 },
  ];

  return (
    // <div>
    //   {users.map((user) => {
    //     return (
    //       <div key={user.id}>
    //         {user.name}--{user.age}
    //       </div>
    //     );
    //   })}
    // </div>
    <>
      <ol>
        {users.map((user) => (
          <li key={user.id}>
            {user.name}--{user.age}
          </li>
        ))}
      </ol>
    </>
  );
}

export default UserList;
