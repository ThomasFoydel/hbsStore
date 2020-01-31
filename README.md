# Node.js, Handlebars.js, and Google Cloud MySQL come together to make a nice little site to sell art on.

not up and running yet!
current objectives:

build out auth flow / login
-async helper functions for login.hbs, store jwt in localStorage?
-express-session
-cookies

- user profile info
  -location
  -profile picture
  -crop and minimize
  -bio

cart

payment
-stripe

orders
-order.hbs ==POST==> shopController.postOrder
-send email to artist
-create order in db
-send email to patron

products
-add date created or use timestamps
-add author(s)

messages
-mysql message schema
-websocket chat ?
