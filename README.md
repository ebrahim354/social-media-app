# LiFacebook

A Facebook-like Social Media App but it's not just another Facebook clone.
This App handles every single request to the back-end with one and only one raw SQL string,
In case of a social media app like Facebook those are quite complicated.
No bloat,No ORMs, No Query Builders, Even WebSockets are just raw WebSockets that are supported by Javascript with a
custom protocol built on top of it.

---

## Why?

Most of the time the performance of an application comes down to its persistance model ( Its Database ),
Nowadays Databases are quite effecient in terms of executing quries and generating query palns,
But, The problem always comes from the quality of that query and the amount of queries that the application
has to send to fulfill one requirement ( Especially if the database and the server are on different machiens ).

This app was a challege to build a real big project that fulfills every request with one effecient SQL command, 
without any over bloated ORMs, With the support of realtime features ( messages, notifications ) 
using the raw WebSocket API provided by any broswer without any external libraries such as SocketIO.

The reason why it's a social media application is that those can have a massive amount of relationships that made this 
challenge even harder.


## Features

* Full user support with authentication using "JWT"
* User Profiles and Friedship between users and friend requests.
* Timeline with posts, comments, likes. 
* Realtime messageing between users, notifications and is online green circle from Facebook.


## Quick Start

The application is running on [social-media](https://social-media-client-sv4c.onrender.com/) if you would like to try it.
There is an existing user with both the username and password "temp" you can login to it directly.
Note that I'm using free tier deployment so the first login is going to take 1-2 minutes in order for the server
to spin up ( They go down with low usage to save resouces ).

