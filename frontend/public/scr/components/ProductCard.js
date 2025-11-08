import React from 'react';

function ProductCard({ product }) {
  return (
    <div>
      <h3>{product.name}</h3>
      <p>₦{product.price}</p>
      <button>Add to Cart</button>
    </div>
  );
}

export default ProductCard;