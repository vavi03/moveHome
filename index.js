//config de express y otras dependencias
const express = require('express');
const path = require('path');
const hbs = require('express-handlebars');

let app = express();

//configuración de la carpeta public
let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static('public'));
//configuración de la carpeta public

//config de handlebars
app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views/layout/'
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
//config de handlebars

//leer datos de los csv
const csv = require('csv-parser');
const fs = require('fs');

let people_list = [];
let houses_list = [];

fs.createReadStream('./data/people.csv')
  .pipe(csv())
  .on('data', (row) => {
    people_list.push(row);
  })
  .on('end', () => {
    //console.log('CSV file successfully processed');
});

fs.createReadStream('./data/casas.csv')
        .pipe(csv())
        .on('data', (row2) => {
            houses_list.push(row2);
        })
        .on('end', () => {
            //console.log('CSV file successfully processed');
});
//leer datos de los csv

//roomies seleccionados
let roomie_list = [];
let roomie_prom;
//roomies seleccionados

//lista de casas recomendas
const LIMIT_TOP = 3;
let knn_houses_list = [];
let top_houses_list = [];
//lista de casas recomendas

//rutas
app.get('/', (req, res) => {
    res.render('landing', {
        title: ''
    });
});

app.get('/roomie', (req, res) => {
    res.render('roomie', {
        people_list: encodeURIComponent(JSON.stringify(people_list))
    });
});

app.get('/house/:id', (req, res) => {
    let house_id = parseInt(req.params.id);
    let house = houses_list[house_id];

    let mascota, parqueadero, zonaVerde;

    if(house.Verde >= 3){
        zonaVerde = "Si";
    }else{
        zonaVerde = "No";
    }

    if(house.Parqueadero >= 3){
        parqueadero = "Si";
    }else{
        parqueadero = "No";
    }

    if(house.Mascota >= 3){
        mascota = "Si";
    }else{
        mascota = "No";
    }

    res.render('house', {
        house: house,
        mascota: mascota,
        parqueadero: parqueadero,
        zonaVerde: zonaVerde
    });
});

app.post('/roomie/select', (req, res) => {
    //promediar, construir roomies seleccionados
    console.log("Roomies seleccionados");
    roomie_list = [];

    for (let index = 0; index < req.body.length; index++) {
        const element = req.body[index];
        
        roomie_list[index] = people_list.filter(p => parseInt(p.Id) === parseInt(element))[0];
    }

    console.log(roomie_list);

    //promediar las variables de todos los integrantes
    roomie_prom = PromediarRoomie(roomie_list);

    //KNN
    knn_houses_list = [];
    top_houses_list = [];

    //comparar el roomie promedio con las casas, sin editar el arreglo original de las casas
    for (let index = 0; index < houses_list.length; index++) {
        const house = houses_list[index];

        //DistanciEuclidiana es el knn
        let house_distancia = DistanciaEuclidiana(roomie_prom, house);
        
        knn_houses_list[index] = house_distancia; 

        house.Similitud = house_distancia;
        house.Match = Math.round(house_distancia * 100);
        top_houses_list.push(house);
    }

    //ordenar de mayor a menor
    top_houses_list.sort(CompararSimilitud);

    res.redirect('/list');
});

app.get('/list', (req, res) => {

    let top_list = [];
    let other_list = [];

    for (let index = 0; index < top_houses_list.length; index++) {
        const element = top_houses_list[index];
        
        if(index < LIMIT_TOP){
            top_list.push(element);
        }else{
            other_list.push(element);
        }
    }

    res.render('list', {
        top_list: top_list,
        other_list: other_list
    });
});
//rutas

//servidor
app.listen(process.env.PORT || 3000, function () {
    console.log("¡Servidor iniciado!")
});
//servidor

//metodos utiles, ordenamientos, similitud, knn, etc
function PromediarRoomie(list){
    let roomie_object = {};

    let keys = Object.keys(list[0]);
    var n = keys.indexOf("Nombre");
    keys.splice(n, 1);
    var c = keys.indexOf("Id");
    keys.splice(c, 1);

    for (let index = 0; index < keys.length; index++) {
        const variable = keys[index];
        
        let temp = 0;

        for (let j = 0; j < list.length; j++) {
            const roomie = list[j];
            temp += parseInt(roomie[variable]);
        }

        roomie_object[variable] = (temp / list.length);
    }

    return roomie_object;
}

function DistanciaEuclidiana(roomie, house){
    let value = 0;
    
    let keys = Object.keys(roomie);

    //sumatoria que piude la formula
    let sumatoria = 0;
    for (let index = 0; index < keys.length; index++) {
        const variable = keys[index];

        //tomo la misma variable para roomie y una casa
        let val1 = roomie[variable];
        let val2 = house[variable];

        //diferencia de variables
        var dif = val1 - val2;

        //elevar al cuadrado y lo agrego a la sumatoria
        sumatoria += (Math.pow(dif, 2));
    }
    
    //esta es la distancia euclidiana
    let distancia = Math.sqrt(sumatoria);

    //nnormalizando, hacer que esté entre 0 y 1
    let distanciaInvertida = 1 / (1 + distancia);

    value = distanciaInvertida;

    //se multiplica por 100 para expresar en porcentaje
    return value;
}

function CompararSimilitud(a, b){
    return b.Similitud - a.Similitud;
}

//metodos utiles, ordenamientos, similitud, knn, etc