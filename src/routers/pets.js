const express = require("express");

const db = require("../utils/database");

const petsRouter = express.Router();

petsRouter.get("/", (req, res)=> {
    let selectAllPetsQuery = "SELECT * FROM pets";

    const selectValues = []
    const queries = []

    if(req.query.type) {
        queries.push({col:'type', val: req.query.type})
    }

    if(req.query.microchip) {
        queries.push({col: 'microchip', val: req.query.microchip})
    }

    if(queries.length>0) {
        let whereClauses = []
        queries.forEach((query, index) => {
            whereClauses.push(`${query.col} = $${index+1}`)
            selectValues.push(query.val)
        })
        selectAllPetsQuery += ' WHERE ' + whereClauses.join(' AND ')
    }

    db.query(selectAllPetsQuery, selectValues)
    .then((databaseResult) => {
        res.json({pets: databaseResult.rows});
    })
    .catch((error)=> {
        res.status(500);
        res.json({error: "Unexpected Error"})
    })
})

petsRouter.get("/:id", (req, res) => {
    const selectPetByIdQuery = `SELECT * FROM pets WHERE id = $1`;
  
    db.query(selectPetByIdQuery, [req.params.id])
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

petsRouter.delete("/:id", (req, res) => {
    const deletePetsQuery = `DELETE FROM books WHERE id = $1 RETURNING *`

    const deleteValues = [
        req.params.id,
    ]
    db.query(deletePetsQuery, deleteValues)
    .then((databaseResult) => {
        if(databaseResult.rowCount === 0) {
            res.status(404)
            res.json({ error: "Pet does not exist"})
        } else {
            res.json({ pets: databaseResult.rows[0]})
        }
    })
    .catch((error) => {
        res.status(500)
        res.json({ error: "unexpected error"})
    })
})

petsRouter.put("/:id", (req, res) => {
    const updatePetsQuery = `
    UPDATE pets SET
    name = $1,
    age = $2,
    type = $3,
    breed = $4,
    microchip = $5
    WHERE id = $6
    RETURNING *`

const updateValues = [
    req.body.name,
    req.body.age,
    req.body.type,
    req.body.breed,
    req.body.microchip,
    req.body.id,
]  

db.query(updatePetsQuery, updateValues)
.then(databaseResult => {
    if(databaseResult.rowCount===0) {
        res.status(404)
        res.json({error: "pet does not exist"})
    }
    else {
        res.json({ pets: databaseResult.rows[0]})
    }
})
.catch(error => {
    res.status(500)
    res.json({error: "unexpected error"})
})
})
  

module.exports = petsRouter