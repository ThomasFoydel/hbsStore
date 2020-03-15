# Node.js, Handlebars.js, and Google Cloud MySQL come together to make a nice little site to sell art on.

not up and running yet!
current objectives:

### payment

- stripe

1. user views products page or store page
2. user clicks add to cart
3. item goes into cart, redirect to cart page
4. user clicks checkout button
5. ?? create orders here, using the session id, then wait until session id is sent to the success route by stripe webhook ??
6. line items created from cart and passed into stripe redirect, cart page redirects to stripe charge page,
7. user completes payments
8. stripe uses webhook to hit page where order objects are created from cartitems (current logic in shop/checkout)
9. route searches for all orders matching the route, change status to "pending"
10. seller uploads tracking number, set order.status to “tracking”

deploy to heroku or use stripe cli to test webhook?

need proxy to access gcloud mysql database from external application
deploy to gcloud, might make more sense than heroku?

### orders

- asynchronous forEach version worked out
- calculate tax ?
- send email to artist (nodemailer?)
- send email to patron

### products

- add date created or use timestamps
- add author(s)

### messages

- mysql message schema
- websocket chat ?

### search function

- author
- title
