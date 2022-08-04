let client = new Paho.MQTT.Client(
    'd57a0d1c39d54550b147b58411d86743.s2.eu.hivemq.cloud',
    8884,
    'letni-skola' + Math.random()
)


client.connect({
    onSuccess: onConnect,
    userName: "robot",
    password: "P@ssW0rd!",
    useSSL: true
});

function onConnect() {
    // Once a connection has been made, make a subscription and send a message.
    console.log("onConnect");

    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    client.subscribe("devices/papago/");
    client.subscribe("devices/netio/messages/events/");
}

function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:" + responseObject.errorMessage);
    }
}

function onMessageArrived(message) {

    //console.log("onMessageArrived:" + message.destinationName);
    //console.log("onMessageArrived:" + message.payloadString);
    //document.getElementById("vlhkost").innerText = message.payloadString;
    

    let obj = JSON.parse(message.payloadString);

    if ("devices/papago/" === message.destinationName) {

        let vypisTyp = document.querySelector("#typ");
        vypisTyp.textContent = obj.type;

        let vypisTeplA = document.querySelector("#teplotaA");
        vypisTeplA.textContent = obj.T1V1_value;

        let vypisVlhkost = document.querySelector("#vlhkost");
        vypisVlhkost.textContent = obj.H1V2_value;

        let vypisRosny = document.querySelector("#rosnyBod");
        vypisRosny.textContent = obj.D1V3_value;

        let vypisTeplB = document.querySelector("#teplotaB");
        vypisTeplB.textContent = obj.T2V1_value;

        
        automatOvladani(message);
           
    }

    else if ("devices/netio/messages/events/" === message.destinationName) {
        for (let i = 0; i < obj.Outputs.length; i++) {
            var cisloZasuvky = obj.Outputs[i];

            var vypisID = document.querySelector("#ID" + cisloZasuvky.ID);
            vypisID.textContent = cisloZasuvky.ID;

            var vypisJmeno = document.querySelector("#jmeno" + cisloZasuvky.ID);
            vypisJmeno.textContent = cisloZasuvky.Name;

            var vypisStav = document.querySelector("#stav" + cisloZasuvky.ID);
            vypisStav.textContent = cisloZasuvky.State;

            var vypisPrikon = document.querySelector("#prikonW" + cisloZasuvky.ID);
            vypisPrikon.textContent = cisloZasuvky.Load;

            var vypisSpotreba = document.querySelector("#SpotrebaWh" + cisloZasuvky.ID);
            vypisSpotreba.textContent = cisloZasuvky.Energy;
        }
    }
}

function sendMessage( akce, idZasuvky) {

    if (akce==0){
        if(idZasuvky == 1){
            message = new Paho.MQTT.Message("{\"Operation\":\"SetOutputs\",\"Outputs\":[{\"ID\":1,\"Action\":0}]}");
        } else if (idZasuvky == 2) { 
            message = new Paho.MQTT.Message("{\"Operation\":\"SetOutputs\",\"Outputs\":[{\"ID\":2,\"Action\":0}]}");
        } else if(idZasuvky ==3) {
            message = new Paho.MQTT.Message("{\"Operation\":\"SetOutputs\",\"Outputs\":[{\"ID\":3,\"Action\":0}]}");
        } else if(idZasuvky ==4) {
            message = new Paho.MQTT.Message("{\"Operation\":\"SetOutputs\",\"Outputs\":[{\"ID\":4,\"Action\":0}]}");
        } else {
            console.log("chyba - špatné idZasuvky")
        }
    }else if (akce==1){
        if(idZasuvky == 1){
            message = new Paho.MQTT.Message("{\"Operation\":\"SetOutputs\",\"Outputs\":[{\"ID\":1,\"Action\":1}]}");
        } else if (idZasuvky == 2) { 
            message = new Paho.MQTT.Message("{\"Operation\":\"SetOutputs\",\"Outputs\":[{\"ID\":2,\"Action\":1}]}");
        } else if(idZasuvky ==3) {
            message = new Paho.MQTT.Message("{\"Operation\":\"SetOutputs\",\"Outputs\":[{\"ID\":3,\"Action\":1}]}");
        } else if(idZasuvky ==4) {
            message = new Paho.MQTT.Message("{\"Operation\":\"SetOutputs\",\"Outputs\":[{\"ID\":4,\"Action\":1}]}");
        } else {
            console.log("chyba - špatné idZasuvky")
        }
    } else{
        console.log("špatný parametr zapnutí - vypnutí")
    }
    message.destinationName = "devices/netio/messages/devicebound/";
    client.send(message)

}


function automatOvladani(message) {

    console.log("onMessageArrived:" + message.payloadString);

    let obj = JSON.parse(message.payloadString);

    let novaVlhkost = Number(obj.H1V2_value)
    console.log(novaVlhkost)

    document.getElementById("vlhkost").innerText = novaVlhkost;
    let vlhkostNastavenaUzivatelem = Number(document.getElementById("display").innerText)
    

    if(novaVlhkost > vlhkostNastavenaUzivatelem){
        sendMessage(0, 2)
       // message = new Paho.MQTT.Message("{\"Operation\":\"SetOutputs\",\"Outputs\":[{\"ID\":2,\"Action\":0}]}");
        console.log("Vypnuto") 
    }else if(novaVlhkost <= vlhkostNastavenaUzivatelem){
        sendMessage(1, 2)
        //message = new Paho.MQTT.Message("{\"Operation\":\"SetOutputs\",\"Outputs\":[{\"ID\":2,\"Action\":1}]}");
        console.log("Zapnuto") 
    }else{
        console.log("špatný parametr automatick0ho vyhodnocovani")
    }

}


function nastavHodnotuVlhkosti(akce){
   
    let vlhkostNastavenaUzivatelem = Number(document.getElementById("display").innerText)

    if(akce == "+"){
        vlhkostNastavenaUzivatelem +=1
    }else if(akce == "-"){
        vlhkostNastavenaUzivatelem -=1
    }else{
        console.log("špatný parametr uzivatelskeho nastaveni kotle")
    }

    document.getElementById("display").innerText = vlhkostNastavenaUzivatelem;
}
