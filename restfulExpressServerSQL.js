import express from "express";
import {readFile, writeFile, appendFile} from "node:fs/promises";
import bodyParser from "body-parser";
import morgan from "morgan";
import postgres from "postgres";


const sql = postgres({
    database: 'petshop',
    username: 'postgres',
    password: 'password'
});
const server = express();
const port = 3000;

server.use(bodyParser.json());
server.use(morgan('tiny'));
server.use(express.json());



const myLogger = function(req,res,next){
    console.log("logging ip", req.ip);
    next();
}
server.use(myLogger);

const checkAPIToken = function (req, res, next) {
    if(req.get("Authorization") !== "HF8930HDFSA"){
        res.status(401);
        res.set("Content-Type", "text/plain");
        res.send("Unauthorized");
    } else {
        next();
    }
};

// const UrlErrorHandlers = function(req,res,next){
//     let input = req.params
//     if(!input){
//         next();
//     }
//     if(input === ''){
//         res.status(404);
//         res.set("Content-Type", "text/plain");
//         res.send("Not Found");
//     } else {
//     next();
//     }
// };



// server.use(UrlErrorHandlers);


server.get("/pets", (req,res,next) => {
const {name} = req.query
    if(name) {
    sql`SELECT * FROM pets WHERE name ILIKE ${name + "%"}`.then((pets) => {
        console.log('hey')
        res.json(pets);
    })
    .catch(next);
    } else {
    sql`SELECT * FROM pets`.then((pets) => {
        res.json(pets);
        })
    .catch(next);
    }
});

server.get("/pets/:id", (req,res,next) => {
    const id = req.params.id;
    sql`SELECT * FROM pets WHERE id = ${id}`.then((result) => {
        if (result.length === 0){
            res.status(404);
            res.set("Content-Type", "text/plain");
            res.send("Not found");    
        } else {
            res.json(result[0]);
        }
    })
    .catch(next);
});



server.post("/pets", (req,res,next) => {
    const pet = req.body;
    const requiredFields = ["name", "age", "kind"];
    const errors = [];
    for(let field of requiredFields){
        if (pet[field] === undefined){
            errors.push(`Missing pet '${field}'.`);
        }
    }
    if (pet.age && typeof pet.age !== "number"){
        errors.push("Pet age must be a number.");
    }
const {age, name, kind} = pet;
    if(errors.length > 0){
        res.status(422);
        res.send(errors.join(" "));
    } else {
    sql`INSERT INTO pets (age, name, kind) VALUES (${age}, ${name}, ${kind}) RETURNING *`.then(
        (result) => {
        res.status(201);
        res.json(result[0]);
            }
        )
        .catch(next);
    }
});




server.patch("/pets/:id", (req,res,next) => {
    const {id} = req.params;
    const {age,name,kind} = req.body;
    //=====================================Works but crashes the server, values are updated upon restart=======
    //=========================================================================================================
    // const errors = [];
    // const pet = req.body
    // const keys = Object.keys(pet).length
    // if (pet.age === true){
    //     if(pet.age && typeof pet.age !== "number"){
    //     errors.push("Pet age must be a number.")};
    // }
    // if(errors.length > 0){
    //     res.status(422);
    //     res.send(errors.join(" "));
    // }
    
    // if(keys === 3) {
    // sql`UPDATE pets SET kind = ${pet.kind}, age = ${pet.age}, name = ${pet.name} WHERE id=${id}`.then((pet) => {
    //     res.status(200);
    //     res.json(pet);
    //     })
    // } else {

    // if (pet.hasOwnProperty("age")) {
    //         sql`UPDATE pets SET age = ${pet.age} WHERE id=${id}`
    //         .then((pet) => {
    //             res.status(200);
    //             res.json(pet);
    //             next();
    //         })
    // }
    // if (pet.hasOwnProperty("name")) {
    //             sql`UPDATE pets SET name = ${pet.name} WHERE id=${id}`
    //             .then((pet) => {
    //             res.status(200);
    //             res.json(pet);
    //             next();
    //             })
    // } 
    // if (pet.hasOwnProperty("kind")) {
    //                 sql`UPDATE pets SET kind = ${pet.kind} WHERE id=${id}`
    //                 .then((pet) => {
    //             res.status(200);
    //             res.json(pet);
    //             next();
    // })
    // }}
    //==============================================================================

sql`
UPDATE pets 
SET 
age=COALESCE(${ age || null}, age), 
kind=COALESCE(${kind || null}, kind), 
name=COALESCE(${ name || null}, name)
WHERE id=${id} RETURNING *
`.then((result) => {
    res.status(200);
    res.json(result[0])
})

})

// AND SET (${name}) AND SET (${kind}) WHERE id=${id}

server.delete("/pets/:id", (req,res,next) => {
    const {id} = req.params
    sql`DELETE FROM pets WHERE id= ${id}`
})



server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
 });


//patch 
//delete






