import Person from "./Props/Person";
import Product from "./Props/Product";

const App = () => {
  return (
    <>
      <Person name="xzh" age={26} />
      <Product name="MacbookProMax" price={9500} />
    </>
  );
};

export default App;
