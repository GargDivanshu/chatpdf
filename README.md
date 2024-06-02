# Overview

This is Chat with PDF, built by me and feel free to check out this project at https://chatpdf-sigma.vercel.app 

1) Enter Filename and description, Upload your Pdf
2) Get a seamless ChatGPT Interface for chatting with Pdf
3) Checkout all your uploaded files from dashboard

# Demo

https://github.com/GargDivanshu/chatpdf/assets/96184674/78e76f20-aeb7-42a6-a668-a4010f061157

# Docker file branch

The docker file can be found at branch 'docker'
build the images and then add your own envs and run
It will generate one web image and one redis image, web image will converse the redis image for implementation of messaging queues.

- `add your api keys in .env file in the root of your project`
- `git clone https://github.com/GargDivanshu/chatpdf.git`
- `cd chatpdf`
- `docker-compose up --build`  

# Technologies and Frameworks

- Next.js
- TypeScript
- Clerk
- Drizzle ORM
- PostgreSQL
- AWS SDK
- OpenAI API
- Pinecone
- Neon Database Serverless
