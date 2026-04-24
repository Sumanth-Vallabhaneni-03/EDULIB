const express = require("express");
const app = express();
app.use(express.json());
require("dotenv").config();
const dbConfig = require("./config/dbConfig");
const port = process.env.PORT || 5000;
const cors = require('cors')

app.use(cors())

const usersRoute = require("./routes/usersRoute");
const booksRoute = require("./routes/booksRoute");
const issuesRoute = require("./routes/issuesRoute");
const reportsRoute = require("./routes/reportsRoute");
const requestsRoute = require("./routes/requestsRoute");
const bookmarksRoute = require("./routes/bookmarksRoute");

app.use("/api/users", usersRoute);
app.use("/api/books", booksRoute);
app.use("/api/issues", issuesRoute);
app.use("/api/reports", reportsRoute);
app.use("/api/requests", requestsRoute);
app.use("/api/bookmarks", bookmarksRoute);

const path = require("path");
__dirname = path.resolve();

if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "development") {
    app.use(express.static(path.join(__dirname, "../client/build")));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
    });
}

app.listen(port, () => console.log(`Node server started at ${port}`));
