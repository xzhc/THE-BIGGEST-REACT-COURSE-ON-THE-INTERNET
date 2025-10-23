export function UserStatus({ loggedIn, isAdmin }) {
  // if (loggedIn) {
  //   if (loggedIn && isAdmin) {
  //     return <p>Welcome Admin!</p>;
  //   } else {
  //     return <p>Welcome User</p>;
  //   }
  // }
  //逻辑冗余不推荐！
  return (
    <>
      {loggedIn && isAdmin && <p>Welcome Admin!</p>}
      {loggedIn && !isAdmin && <p>Welcome User</p>}
    </>
  );
}
