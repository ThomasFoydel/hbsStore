exports.quantifyCart = function(cart) {
  let productsSoFar = [];
  let quantifiedCart = [];

  cart.forEach(item => {
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
        totalPrice: item.price,
        title: item.title
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
        totalPrice: item.price * newQuantity,
        title: item.title
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

exports.makeLineItems = quantifiedCart => {
  console.log('make line items makeLineItems quanitified cart: ');

  const lineItems = quantifiedCart.map(item => {
    return {
      name: item.title,
      images: [item.imageUrl],
      amount: item.price,
      currency: 'usd',
      quantity: item.quantity
    };
  });

  return lineItems;
};
