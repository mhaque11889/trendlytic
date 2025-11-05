"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app");
const connection_1 = require("./db/connection");
const Author_1 = require("./models/Author");
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
async function bootstrap() {
    await (0, connection_1.connectToDatabase)();
    // Ensure legacy unique index on authors.name is removed to allow multiple papers per author
    try {
        await Author_1.AuthorModel.collection.dropIndex('name_1');
    }
    catch {
        // ignore if it doesn't exist
    }
    try {
        await Author_1.AuthorModel.syncIndexes();
    }
    catch {
        // ignore
    }
    const app = (0, app_1.createApp)();
    app.listen(PORT, () => {
        // eslint-disable-next-line no-console
        console.log(`API listening on http://localhost:${PORT}`);
    });
}
bootstrap().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Fatal startup error', err);
    process.exit(1);
});
