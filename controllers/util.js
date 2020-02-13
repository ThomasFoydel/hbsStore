exports.quantifyCart = function(cart) {
  let productsSoFar = [];
  let quantifiedCart = [];

  cart.forEach(item => {
    // console.log('ITEM!!!!!: ', item);
    if (productsSoFar.indexOf(item.product) === -1) {
      productsSoFar.push(item.product);
      quantifiedCart.push({
        id: item.id,
        customer: item.customer,
        product: item.product,
        price: item.price,
        imageUrl: item.imageUrl,
        seller: item.seller,
        quantity: 1,
        totalPrice: item.price
      });
    } else {
      let filteredCart = quantifiedCart.filter(element => {
        return element.product === item.product;
      });
      let alreadyExistingItem = filteredCart[0];
      let newQuantity = alreadyExistingItem.quantity + 1;
      let itemWithNewQuantity = {
        id: item.id,
        customer: item.customer,
        product: item.product,
        price: item.price,
        imageUrl: item.imageUrl,
        seller: item.seller,
        quantity: newQuantity,
        totalPrice: item.price * newQuantity
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