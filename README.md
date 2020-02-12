# Node.js, Handlebars.js, and Google Cloud MySQL come together to make a nice little site to sell art on.

not up and running yet!
current objectives:

### build out auth flow / login

- auth flow that used ajax call to fetch jwt and store jwt in localStorage involved putting too much logic into the handlebars templates / seemed to go against MVC pattern, which is supposed to be the spirit of this project
- switch to express-session instead
- store sessions in Google Cloud MySQL

### user profile info

- location
- profile picture
- crop and minimize
- bio

### cart

- async forEach bug resolved
- added imageUrl and price to cartItem

### payment

- stripe

### orders

- fix totalprice calculation
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
