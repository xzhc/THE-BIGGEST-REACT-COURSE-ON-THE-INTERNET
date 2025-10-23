import Card from "./Card";

export function UseCard() {
  return (
    <div>
      <h1>My Cards</h1>
      <Card>
        <h2>Card Title 1</h2>
        <p>This is some content for Card1</p>
      </Card>
      <Card>
        <h2>Card Title 2</h2>
        <p>This is some content for Card2</p>
      </Card>
      <Card>
        <h2>Card Title 3</h2>
        <p>This is some content for Card3</p>
      </Card>
    </div>
  );
}
