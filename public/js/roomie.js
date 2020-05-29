console.log("Lista de personas ya pasa al front", list);

let roomie_1 = document.getElementById("roomie1");
let roomie_2 = document.getElementById("roomie2");
let roomie_3 = document.getElementById("roomie3");
let roomie_4 = document.getElementById("roomie4");

roomie_1.options[0] = new Option("Sin escoger", 0);
roomie_2.options[0] = new Option("Sin escoger", 0);
roomie_3.options[0] = new Option("Sin escoger", 0);
roomie_4.options[0] = new Option("Sin escoger", 0);

for (let index = 1; index < list.length + 1; index++) {
    const element = list[index - 1];
    roomie_1.options[index] = new Option(element.Nombre, index.Id);
    roomie_2.options[index] = new Option(element.Nombre, index.Id);
    roomie_3.options[index] = new Option(element.Nombre, index.Id);
    roomie_4.options[index] = new Option(element.Nombre, index.Id);
}

let btn = document.getElementsByClassName("App-roomieButton")[0];

btn.onclick = SubmitRoomie;

function SubmitRoomie() {

    let list_id = [];

    if(roomie_1.selectedIndex > 0){
        list_id.push(roomie_1.selectedIndex - 1);
    }else{
        return;
    }

    if(roomie_2.selectedIndex > 0){
        list_id.push(roomie_2.selectedIndex - 1);
    }

    if(roomie_3.selectedIndex > 0){
        list_id.push(roomie_3.selectedIndex - 1);
    }

    if(roomie_4.selectedIndex > 0){
        list_id.push(roomie_4.selectedIndex - 1);
    }

    if(list_id.length === 0){
        return;
    }

    fetch("/roomie/select", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(list_id)
        })
        .then(function (res) {
            //actualiza la página
            window.location = res.url;
            console.log(res);
        })
        .catch(function (res) {
            console.log(res);
    });
}