window.addEventListener('load',()=>{
    let j = 2
    var form = document.getElementById('form-data')
    form.addEventListener('submit',(event)=>{
        event.preventDefault()
        $('#cards').empty()
        fetchData(event.target)
    })
    var addBtn = document.getElementById('add')
    addBtn.addEventListener('click',(event)=>{
        event.preventDefault()
        j++
        if(j<=5)
        addCountry(j)
        else alert("it's sorry that it can only track 5 countries!")
    })
    fillDataList()
})

const fillDataList = ()=>{
    let url = 'https://pomber.github.io/covid19/timeseries.json'
    let countryList = []
    fetch(url)
    .then(res=>res.json())
    .then(res=>{
        countryList = Object.keys(res)
        console.log(Object.keys(res), " Are all Countries being Tracked")
        localStorage.setItem('cList', JSON.stringify(countryList))
        countryList.forEach((cntry)=>{
            $('datalist').append(`<option value="${cntry}">`)
        })
    })
}

const addCountry = (j)=>{
    $('#inputDiv').append(`<input type="text" class="form-control  mx-auto font-weight-bold wi-75" name="Country"  placeholder="Enter Country Name..." list="country${j}">
    <datalist id="country${j}"></datalist>`)
    let cList = JSON.parse(localStorage.getItem('cList'))
    cList.forEach((cntry)=>{
        $(`#country${j}`).append(`<option value="${cntry}">`)
    })
}

const fetchData = async (target)=>{
    
    let i = 1
    let longest = []
    let mainDB = {}
    let graphDB = []
    let dateLabels = {}
    let correctDate
    let type = $('#type').val()
    let typeData
    let url = 'https://pomber.github.io/covid19/timeseries.json'
    await fetch(url)
    .then(res=>res.json())
    .then(res=>{
            
        Array.from(target).forEach((elem)=>{
        if(elem.name == 'Country' && elem.value != '')
        {
            country = elem.value
      //      console.log("current country is ", country)
            mainDB[country]= [] 
            dateLabels[country] = []

            res[country].forEach(({ date, confirmed, recovered, deaths })=>{

                switch(type){
                    case 'Confirmed': typeData = confirmed; break;
                    case 'Recovered': typeData = recovered; break;
                    case 'Deceased': typeData = deaths; break;
                }

                correctDate = formatDate(date)
                mainDB[country].push({x:correctDate, y: Number(typeData)})
                dateLabels[country].push(correctDate)
                latestConf = confirmed 
                latestReco = recovered 
                latestDead = deaths 
                latestDate = correctDate
            })

            $('#date').text('Data as of '+latestDate)
            createCard(country, latestConf, latestReco, latestDead)
            
            if(dateLabels[country].length > longest.length) longest = [...dateLabels[country]]

            console.log(mainDB[country], " is ", country)


            switch(i)
            {
                case 1: clr = 'rgb(255, 0, 0)'; break;
                case 2: clr = 'rgb(0, 255, 0)'; break;
                case 3: clr = 'rgb(0, 0, 255)'; break;
                case 4: clr = 'rgb(232, 122, 199)'; break;
                case 5: clr = 'rgb(60, 201, 215)'; break;
            }
            i++

            let obj = {
                label: country,
                backgroundColor:clr,
                borderColor: clr,
                data: mainDB[country],
                fill: false,
                pointHoverBackgroundColor: 'rgb(0,0,0)',
                pointHoverRadius: 6,
            }

            graphDB.push(obj)
        }       
        })
    })
    .catch((err)=>{
        alert('Country name might be incorrect.')
    })
    drawGraph(graphDB, longest, type)
    
}

const drawGraph = (graphDB, longest, type)=>{


    let config = {
        type : 'line',
        data : {
            labels:  longest ,
            datasets: graphDB ,
        },
        options: {
            responsive: true,
            legend: {
                labels: {
                    fontColor: 'white',
                    fontSize: 20,
                }
            },
            title: {
                display: false,
                text: 'Covid 19 Cases'
            },
            tooltips: {
                mode: 'x',
                backgroundColor: 'rgb(0,128,0)',
         //   	intersect: false,
                titleFontSize: 18,
                bodyFontSize: 17,
            },
            hover: {
                mode: 'index',
                intersect: true
            },    
            scales: {
                xAxes: [{
                    type : 'time',
                    distribution: 'series',
                    ticks: {
                        fontSize: 17,
                        fontColor: 'grey'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: type.toUpperCase()+'   CASES',
                        fontColor: 'white'
                    },
                    ticks: {
                        fontSize: 20,
                        fontColor: 'grey'
                    }
                        }]
            },
        }
    }
    $('canvas').remove()
    $('#chart-container').append('<canvas id="canvas"></canvas>')
    var ctx = document.getElementById('canvas').getContext('2d');
    ctx.clearRect(0,0, canvas.width, canvas.height)
    window.myLine = new Chart(ctx, config);
}

const createCard = (country, latestConf, latestReco, latestDead)=>{
    $('#cards').append(`<div class="card">
    <div class="card-body">
    <h5 class="card-title">${country}</h5>

    <p class="mt-3 text-info"> Confirmed : ${latestConf}</p>
    <p class="text-success"> Recovered : ${latestReco}</p>
    <p class="text-danger"> Deaths : ${latestDead}</p>`)
}

const formatDate = (dateInWrongFormat)=>
{   
    var len = dateInWrongFormat.length
    var lastPos = dateInWrongFormat.lastIndexOf('-')
    let day = dateInWrongFormat.slice(lastPos+1)
    var firstPos = dateInWrongFormat.indexOf('-')
    let month = dateInWrongFormat.slice(firstPos+1, lastPos)
    let year = dateInWrongFormat.substr(0,4)
//     console.log("year ",year," month ",month, " day ",day)
    return new Date(year, month-1, day)
}
