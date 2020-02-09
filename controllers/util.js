exports.quantifyCart = function(cart) {
  let productsSoFar = [];
  let quantifiedCart = [];

  cart.forEach(item => {
    if (productsSoFar.indexOf(item.product) === -1) {
      productsSoFar.push(item.product);
      quantifiedCart.push({
        id: item.id,
        product: item.product,
        price: item.price,
        imageUrl: item.imageUrl,
        seller: item.seller,
        quantity: 1
      });
    } else {
      let filteredCart = quantifiedCart.filter(element => {
        return element.product === item.product;
      });
      let alreadyExistingItem = filteredCart[0];
      let newQuantity = alreadyExistingItem.quantity + 1;
      let itemWithNewQuantity = {
        id: item.id,
        product: item.product,
        price: item.price,
        imageUrl: item.imageUrl,
        seller: item.seller,
        quantity: newQuantity
      };
      let arrayWithoutNewItem = quantifiedCart.filter(i => {
        return i.product !== item.product;
      });
      let updatedQuantifiedCart = [...arrayWithoutNewItem, itemWithNewQuantity];
      quantifiedCart = updatedQuantifiedCart;
    }
  });
  return quantifiedCart;
};
