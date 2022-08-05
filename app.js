"use strict"

const { spawn, spawnSync } = require('child_process');
const fs = require("fs");
const readline = require("readline");
const express = require("express");

function main() {
    StartServer();
}

function StartServer(){
    const app = express();
    const urlencodedParser = express.urlencoded({extended: false});
    app.set("view engine", "hbs");
    app.use("/static",express.static(__dirname + "\\static"));
    app.get("/", function(request, response){
        response.render("index.hbs");
    });
    app.post("/", urlencodedParser, function (request, response) {
        if(!request.body) return response.sendStatus(400);
        let promice = GetNamesArray();
        promice.then((massName)=>{
            let isFind = false;
            let FindName;
            for (let i = 0; i < massName.length; i++) {
                if(massName[i] == request.body.Name){
                    FindName = massName[i];
                    isFind = true;
                    break;
                }
            }
            if (isFind) {
                return response.redirect("True/"+FindName);
            }
            return response.redirect("False/"+FindName);
        });
    });
    app.get("/True/:FindName",(request, response)=>{
        response.render("True.hbs", {name : request.params["FindName"]});
    });
    app.get("/False/:FindName",(request, response)=>{
        response.render("False.hbs", {name : request.params["FindName"]});
    });
    app.listen(3000);
    console.log("Server start!");
}

async function GetNamesArray() {
    let child = spawnSync("powershell.exe",['-ExecutionPolicy', 'ByPass', __dirname + "\\Script.ps1"]);
    
    return await ReadUsersFromFile();
}

function ReadUsersFromFile() {
    return new Promise((resolve, reject)=>{
        let array = [];
    
        const readInterface = readline.createInterface({ 
            input: fs.createReadStream(".\\localUsers.txt","utf16le"), 
            output: process.stdout, 
            console: false 
        }); 

        let lineNumber = 0;
        readInterface.on("line",(line=>{
            for (lineNumber; lineNumber < 4;) {
                lineNumber++;
                return;
            }
            let newLine = ProcessLine(line);
            if (newLine){
                array.push(newLine);
            }
        }));
        readInterface.on("close",()=>{
            resolve (array);
        });
    })
}

function ProcessLine(line) {
    let index = line.lastIndexOf("True");
    if (index == -1) {
        index = line.lastIndexOf("False");
    }
    return line.slice(0,index).trim();
}

main();