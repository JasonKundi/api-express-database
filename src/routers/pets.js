const express = require("express");

const db = require("../utils/database");

const petsRouter = express.Router();

petsRouter.get("/", (req, res)=> {
    const selectAllPetsQuery = "SELECT * FROM pets";

    db.query(selectAllPetsQuery)
    .then((databaseResult) => {
        res.json({pets: databaseResult.rows});
    })
    .catch((error)=> {
        res.status(500);
        res.json({error: "Unexpected Error"})
    })
})

petsRouter.get("/?=type=", (req, res) => {
    let type = req.query.id
    const selectByTypeQuery = `SELECT * FROM pets WHERE type = $1`;
    

    db.query(selectByTypeQuery, type )
    .then((databaseResult) => {
        console.log(databaseResult.rows);
        if (databaseResult.rowCount === 0) {
          res.status(404);
          res.json({ error: "Pet type does not EXIST" });
        }
        res.json({ book: databaseResult.rows[0] });
      })
      .catch((error) => {
        res.status(500);
        res.json({ error: "Unexpected Error" });
        console.log(error);
      });
    
})

petsRouter.get("/:id", (req, res) => {
    const selectBookByIdQuery = `SELECT * FROM pets WHERE id = $1`;
  
    db.query(selectBookByIdQuery, [req.params.id])
      .then((databaseResult) => {
        console.log(databaseResult.rows);
        if (databaseResult.rowCount === 0) {
          res.status(404);
          res.json({ error: "Pet does not EXIST" });
        }
        res.json({ book: databaseResult.rows[0] });
      })
      .catch((error) => {
        res.status(500);
        res.json({ error: "Unexpected Error" });
        console.log(error);
      });
  });

  petsRouter.post("/", (req, res) => {
    const insertPetsSql = `INSERT INTO pets(
      name, 
      age, 
      type, 
      breed, 
      microchip)
      VALUES($1, $2, $3, $4, $5)
      RETURNING *`;
  
    const petsValues = [
      req.body.name,
      req.body.age,
      req.body.type,
      req.body.breed,
      req.body.microchip,
    ];
  
    db.query(insertPetsSql, petsValues)
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
  

module.exports = petsRouter