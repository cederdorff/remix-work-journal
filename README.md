# A Remix stack with Mongoose integration

This is a basic [custom template][custom-template] that integrates [Remix][remix] with [Mongoose][mongoose] (and thereby [MongoDB][mongodb]), and configures [Tailwind CSS][tailwindcss] and [Prettier][prettier].

It is based on [bewildergeist/remix-mongoose-stack](https://github.com/bewildergeist/remix-mongoose-stack).

## Getting started

1. Rename `.env.example` to `.env` and add your MongoDB connection string as the `MONGODB_URL` variable — remember to include a database name at the end of the connection string.
2. Install dependencies: `npm install`

## Development

From your terminal:

```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

[custom-template]: https://remix.run/docs/en/main/guides/templates
[tailwindcss]: https://tailwindcss.com
[mongodb]: https://www.mongodb.com/atlas
[mongoose]: https://mongoosejs.com
[prettier]: https://prettier.io
[remix]: https://remix.run
