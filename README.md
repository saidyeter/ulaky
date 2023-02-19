# Ulaky

`Ulaky` is a messaging app

What `Ulaky` is;  
`Ulak` is an old Turkish word. It means a person who delivers news or message.  
Y stands for `Yeter`. Which is my last name.  
So, Ulak Yeter is an expression just like [Doctor Öz](https://en.wikipedia.org/wiki/Mehmet_Oz)

This is a [Next.js](https://nextjs.org/) app.

`Ulaky` uses [MongoDB](https://www.mongodb.com/) to store chat keys and images.  
`Ulaky` uses [MySQL](https://www.mysql.com/) to store user accounts and chat details.  

## Requirements
- [Node.js](https://nodejs.org/en/)
- [Docker](https://www.docker.com/)

## Instructions
In the root folder of project
- Use `yarn` to install dependencies
- Use `docker compose up` to run MongoDB and MySQL
- Copy `.env.example` file to `.env` 
- Use `npx prisma db push` to create db tables 
- Use `npx prisma db seed` to create sample data
- Use `yarn dev` to run locally 

## License

MIT License

Copyright (c) 2023 Said Yeter

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
