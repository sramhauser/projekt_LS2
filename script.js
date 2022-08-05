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

        //let vypisTyp = document.querySelector("#typ");
        //vypisTyp.textContent = obj.type;

        let vypisTeplA = document.querySelector("#teplotaA");
        vypisTeplA.textContent = obj.T1V1_value;

        let vypisVlhkost = document.querySelector("#vlhkost");
        vypisVlhkost.textContent = obj.H1V2_value;

        let vypisRosny = document.querySelector("#rosnyBod");
        vypisRosny.textContent = obj.D1V3_value;

        let vypisTeplB = document.querySelector("#teplotaB");
        vypisTeplB.textContent = obj.T2V1_value;


        automatOvladani(message);
        dataPapagoTeplA.push(Number(obj.T1V1_value));
        dataPapagoVlh.push(Number(obj.H1V2_value));
        dataPapagoRos.push(Number(obj.D1V3_value));
        dataPapagoTeplB.push(Number(obj.T1V1_value));
        dataPapagoPrumerTeplot.push((Number(obj.T1V1_value) + Number(obj.T1V1_value)) / 2)
        myChart.update();

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

function sendMessage(akce, idZasuvky) {

    if (akce == 0) {
        if (idZasuvky == 1) {
            message = new Paho.MQTT.Message("{\"Operation\":\"SetOutputs\",\"Outputs\":[{\"ID\":1,\"Action\":0}]}");

        } else if (idZasuvky == 2) {
            message = new Paho.MQTT.Message("{\"Operation\":\"SetOutputs\",\"Outputs\":[{\"ID\":2,\"Action\":0}]}");
        } else if (idZasuvky == 3) {
            message = new Paho.MQTT.Message("{\"Operation\":\"SetOutputs\",\"Outputs\":[{\"ID\":3,\"Action\":0}]}");
        } else if (idZasuvky == 4) {
            message = new Paho.MQTT.Message("{\"Operation\":\"SetOutputs\",\"Outputs\":[{\"ID\":4,\"Action\":0}]}");
        } else {
            console.log("chyba - špatné idZasuvky")
        }
    } else if (akce == 1) {
        if (idZasuvky == 1) {
            message = new Paho.MQTT.Message("{\"Operation\":\"SetOutputs\",\"Outputs\":[{\"ID\":1,\"Action\":1}]}");
        } else if (idZasuvky == 2) {
            message = new Paho.MQTT.Message("{\"Operation\":\"SetOutputs\",\"Outputs\":[{\"ID\":2,\"Action\":1}]}");
        } else if (idZasuvky == 3) {
            message = new Paho.MQTT.Message("{\"Operation\":\"SetOutputs\",\"Outputs\":[{\"ID\":3,\"Action\":1}]}");
        } else if (idZasuvky == 4) {
            message = new Paho.MQTT.Message("{\"Operation\":\"SetOutputs\",\"Outputs\":[{\"ID\":4,\"Action\":1}]}");
        } else {
            console.log("chyba - špatné idZasuvky")
        }
    } else {
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


    if (novaVlhkost > vlhkostNastavenaUzivatelem) {
        sendMessage(1, 4)
        zasuvka4b()
        // message = new Paho.MQTT.Message("{\"Operation\":\"SetOutputs\",\"Outputs\":[{\"ID\":2,\"Action\":0}]}");
        console.log("Zapnuto")
    } else if (novaVlhkost <= vlhkostNastavenaUzivatelem) {
        sendMessage(0, 4)
        zasuvka4()
        //message = new Paho.MQTT.Message("{\"Operation\":\"SetOutputs\",\"Outputs\":[{\"ID\":2,\"Action\":1}]}");
        console.log("Vypnuto")
    } else {
        console.log("špatný parametr automatick0ho vyhodnocovani")
    }

}


function nastavHodnotuVlhkosti(akce) {

    let vlhkostNastavenaUzivatelem = Number(document.getElementById("display").innerText)

    if (akce == "+") {
        vlhkostNastavenaUzivatelem += 1
    } else if (akce == "-") {
        vlhkostNastavenaUzivatelem -= 1
    } else {
        console.log("špatný parametr uzivatelskeho nastaveni kotle")
    }

    document.getElementById("display").innerText = vlhkostNastavenaUzivatelem;
}


//nastavení grafu teplota a vlhkost
dataPapagoTeplA = [];

dataPapagoVlh = [];

dataPapagoRos = [];

dataPapagoTeplB = [];

dataPapagoPrumerTeplot = [];


function numbers(config) {
    return [1, 5, 6, 88, 68, 56]

}

const CHART_COLORS = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
};

const NAMED_COLORS = [
    CHART_COLORS.red,
    CHART_COLORS.orange,
    CHART_COLORS.yellow,
    CHART_COLORS.green,
    CHART_COLORS.blue,
    CHART_COLORS.purple,
    CHART_COLORS.grey,
];

const DATA_COUNT = 7;
const NUMBER_CFG = { count: DATA_COUNT, min: -100, max: 100 };

const labels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const data = {
    labels: labels,
    datasets: [
        {
            label: 'Průměrná teplota [°C]',
            data: dataPapagoPrumerTeplot,
            borderColor: CHART_COLORS.red,
            yAxisID: 'y',
        },
        {
            label: 'Vzdušná vlhkost [%]',
            data: dataPapagoVlh,
            borderColor: CHART_COLORS.blue,
            yAxisID: 'y1',
        }
    ]
};



const config = {
    type: 'line',
    data: data,
    options: {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        stacked: false,
        plugins: {
            title: {
                display: true,
                text: 'Chart.js Line Chart - Multi Axis'
            }
        },
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',

                // grid line settings
                grid: {
                    drawOnChartArea: false, // only want the grid lines for one axis to show up
                },
            },
        }
    },
};

const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, config)



//konec nastavení grafu teplota a vlhkost


function zasuvka1() {
    document.getElementById("prvniZasuvkaZ").style = "display: none"

}

function zasuvka1b() {
    document.getElementById("prvniZasuvkaZ").style = null

}

function zasuvka2() {
    document.getElementById("druhaZasuvkaZ").style = "display: none"

}

function zasuvka2b() {
    document.getElementById("druhaZasuvkaZ").style = null

}

function zasuvka3() {
    document.getElementById("tretiZasuvkaZ").style = "display: none"

}

function zasuvka3b() {
    document.getElementById("tretiZasuvkaZ").style = null

}

function zasuvka4() {
    document.getElementById("ctvrtaZasuvkaZ").style = "display: none"

}

function zasuvka4b() {
    document.getElementById("ctvrtaZasuvkaZ").style = null

}