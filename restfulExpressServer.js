import express from "express";
import {readFile, writeFile, appendFile} from "node:fs/promises";
import bodyParser from "body-parser";
import morgan from "morgan";
import { openStdin } from "node:process";
import { appendFileSync } from "node:fs";
const server = express();
const port = 3000;

server.use(bodyParser.json());
server.use(morgan('short'));
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
}


server.get("/pets", (req,res) => {
    readFile("./pets.json", "utf-8").then((text) => {
        res.json(JSON.parse(text));
    })
});

// server.use(morgan);
// server.use(bodyParser);
// server.use(checkAPIToken);

server.get("/pets/:index", (req,res) => {
    // both foo and index are interchangable parameters. Req.params can be applied to anything
        const {index} = req.params;
        readFile("./pets.json", "utf-8").then((text) => {
            const pets = JSON.parse(text);
            const selectedPet = pets[index];
            if (selectedPet !== undefined){
                res.json(selectedPet);
            } else {
                 res.status(404);
                 res.set("Content-Type", "text/plain");
                 res.send("Not Found");
        }
    })
});

server.post("/pets", (req,res) => {
    const pet = req.body;
    readFile("./pets.json", "utf-8").then((text) => {
        let pets = JSON.parse(text);
        pets.push(pet);
    writeFile("./pets.json", JSON.stringify(pets), "utf-8").then(() => {
        res.json(pet)
        })
    })
}); 


server.patch("/pets/:index", (req,res) => {
    const {index} = req.params;
    const updates = req.body;
    readFile("./pets.json", "utf-8").then((text) => {
        const pets = JSON.parse(text);
        const existingPet = pets[index];
        for(let key in updates){
            existingPet[key] = updates[key];
        }    
        return writeFile("./pets.json", JSON.stringify(pets)).then(() => {
            res.json(existingPet);
        })
    })
});




server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
 });
