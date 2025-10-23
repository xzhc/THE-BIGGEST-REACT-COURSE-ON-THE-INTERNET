import Person from "./PropsDestructuring/Person";
import Product from "./PropsDestructuring/Product";
const App = () => {
  return (
    <>
      <Person name="xzh" age={26} />
      <Product name="MacbookProMax" price={9500} />
    </>
  );
};

export default App;
