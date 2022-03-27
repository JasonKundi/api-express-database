const express = require("express");

//Required our database - this db variable
//is actually a "Client" object from the
//node postgres library: https://node-postgres.com/api/client
const db = require("../utils/database");

const booksRouter = express.Router();

//GET /books - getting all books from the database
booksRouter.get("/", (req, res) => {
  const selectAllBooksQuery = "SELECT * FROM books";

  //Using the query method to send a SQL query
  //to the database. This is asynchronous - so
  //we use our "then" callbacks to handle the
  //response
  db.query(selectAllBooksQuery)
    .then((databaseResult) => {
      //Log the result to the console
      console.log(databaseResult);
      //Send back the rows we got from the query
      //to the client
      res.json({ books: databaseResult.rows });
    })
    //If there is a database error, the callback
    //we provide to catch will be called. In this
    //case we want to send the client a 500 (server error)
    //and log out the message
    .catch((error) => {
      res.status(500);
      res.json({ error: "Unexpected Error" });
      console.log(error);
    });
});

booksRouter.get("/:id", (req, res) => {
  const selectBookByIdQuery = `SELECT * FROM books WHERE id = $1`;

  db.query(selectBookByIdQuery, [req.params.id])
    .then((databaseResult) => {
      console.log(databaseResult.rows);
      if (databaseResult.rowCount === 0) {
        res.status(404);
        res.json({ error: "Book does not EXIST" });
      }
      res.json({ book: databaseResult.rows[0] });
    })
    .catch((error) => {
      res.status(500);
      res.json({ error: "Unexpected Error" });
      console.log(error);
    });
});

booksRouter.post("/", (req, res) => {
  const insertBooksSql = `INSERT INTO books(
    title, 
    type, 
    author, 
    topic, 
    publicationDate, 
    pages)
    VALUES($1, $2, $3, $4, $5, $6)
    RETURNING *`;

  const bookValues = [
    req.body.title,
    req.body.type,
    req.body.author,
    req.body.topic,
    req.body.publicationDate,
    req.body.pages,
  ];

  db.query(insertBooksSql, bookValues)
  .then((databaseResult => {
    console.log(databaseResult)
    res.json({book: databaseResult.rows[0]})
  }))
  .catch(error => {
    console.log(error)
    res.status(500)
    res.json({error: 'Unexpected Error'})
  })
});


module.exports = booksRouter;
