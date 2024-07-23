'use strict';

const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(
  cors({
    origin: "https://fullstackfinalproject-b2gn.onrender.com/",
  })
);
app.use(express.json());

const port = 3005;
let things = [];
let favorites = [];

app.get('/', (req, res)=>{
    console.log('GET was sent');
    res.send('GET: gotten');
});

app.get('/activity/', (req, res)=>{
    const type = req.query.type;
    console.log('GET was sent ' + type);
    let filtered = [];
    if(type != 'none'){
        for (let i = 0; i < things.length; i++) {
            const element = things[i];
            if(element.type == type){
                filtered.push(element);
            }
        }
    } else{
        filtered = things;
    }
    let randnum = Math.floor(Math.random() * filtered.length);
    let response = filtered[randnum];
    console.log(filtered.length);
    console.log('GET: type was ' + type);
    console.log(response);
    res.send(response);
});

app.get('/favorites/', (req, res)=>{
    console.log('GET all faves was sent');
    const rawfaves = fs.readFileSync('./data/favorites.json');
    favorites = JSON.parse(rawfaves);
    res.send(favorites);
});
app.post('/favorite/post/:key', (req, res)=>{
    var id = req.params.key;
    console.log('POST was called: ' + id);
    const favthing = favorites.find((thing) => thing.key === id);
    if(favthing){
        res.status(400).send('Already favorited');
    } else{
        const thing = things.find((thing) => thing.key === id);
        favorites.push(thing);
        fs.writeFileSync('./data/favorites.json', JSON.stringify(favorites));
        res.send('New Favorite: ' + thing.activity);
    }
});
app.put('/favorite/update/', (req, res)=>{
    const fav = req.body;
    console.log('FAVE');
    console.log(fav);
    console.log('PUT was called: ' + fav.key);
    const rawfaves = fs.readFileSync('./data/favorites.json');
    favorites = JSON.parse(rawfaves);
    const favthing = favorites.findIndex((a) => a.key == fav.key);
    console.log('FAVTHING');
    console.log(favthing);
    if(favthing >= 0){
        let prevfav = favorites[favthing];
        favorites.splice(favthing, 1, {
            'activity': fav.activity,
            'availability': prevfav.availability,
            'type':prevfav.type,
            'participants': prevfav.participants,
            'price': prevfav.price,
            'accessibility': prevfav.accessibility,
            'duration': prevfav.duration,
            'kidfriendly': prevfav.kidfriendly,
            'link': prevfav.link,
            'key': fav.key,
        });
        fs.writeFileSync('./data/favorites.json', JSON.stringify(favorites));
        res.send('Favorite updated from: ' + prevfav.activity + ' to: ' + fav.activity);
    }
    else{
        res.status(400).send('Favorite not found');
    }
});
app.delete('/favorite/delete/:key', (req, res)=>{
    let id = req.params.key;
    console.log(id);
    console.log('DELETE was called: ' + id);
    const index = favorites.findIndex((thing) => thing.key === id);
    console.log("index: " + index);
    if(index >= 0) favorites.splice(index, 1);
    console.log(favorites);
    fs.writeFileSync('./data/favorites.json', JSON.stringify(favorites));
    res.send('Delete Successful on '+ id);
});

app.listen(port, ()=>{
    const rawdata = fs.readFileSync('./data/activities.json');
    things = JSON.parse(rawdata);
    console.log('Loaded ' + things.length + ' things');
    console.log('Listening on port ', port);
})