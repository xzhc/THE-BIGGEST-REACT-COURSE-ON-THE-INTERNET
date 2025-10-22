function ProductInfo() {
  const product = {
    name: "Laptop",
    price: "$1200",
    availability: "In stock",
  };
  return (
    <div>
      <p>Product name is{product.name}</p>
      <p>The price is {product.price}</p>
      <p>The availability is {product.availability}</p>
    </div>
  );
}

export default ProductInfo;
