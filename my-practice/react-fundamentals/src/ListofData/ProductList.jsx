const ProductList = () => {
  const products = [
    { id: 1, name: "Phone", price: "$699" },
    { id: 2, name: "Laptop", price: "$1200" },
    { id: 3, name: "Headphones", price: "$199" },
  ];
  return (
    <ol>
      {products.map((product) => (
        <div id={product.id}>
          {product.name}--{product.price}
        </div>
      ))}
    </ol>
  );
};

export default ProductList;
