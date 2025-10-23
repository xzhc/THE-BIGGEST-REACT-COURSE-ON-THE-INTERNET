export function StyledCard() {
  const style = {
    backgroundColor: "lightblue",
    padding: "20px",
    borderRadius: "10px",
    color: "darkblue",
  };
  return (
    <div style={style}>
      <h1>Card1</h1>
      <p>This is a StyledCard</p>
    </div>
  );
}
