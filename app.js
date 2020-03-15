const express = require('express');

let app = express();

app.use((req, res, next) => {
    console.log(`path: ${req.path}`);
    next();
});



app.use((req, res, next) => {
    res.status(404);
    res.send(`
        page not found
    `);
});

app.listen(8080);