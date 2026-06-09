/***************************************************************************
* Objetivo     : Arquivo responsável por consumir a API Open-Meteo
* Data         : 09/06/2026
* Desenvolvedor: Lucas Alexandre da Silva
* Versão       : 1.0
****************************************************************************/

'use strict'

// Função responsável por buscar a cidade e retornar latitude e longitude
const getCidade = async function(cidade){

    const endpoint = `https://geocoding-api.open-meteo.com/v1/search?name=${cidade}&count=1&language=pt&format=json`

    const response = await fetch(endpoint)
    const data = await response.json()

    return data.results[0]
}

// Função responsável por buscar os dados climáticos
const getClima = async function(latitude, longitude){

    const endpoint = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,weather_code&hourly=temperature_2m,weather_code&timezone=auto`

    const response = await fetch(endpoint)
    const data = await response.json()

    return data
}

// Função responsável por retornar o ícone de acordo com o clima
const getIconeClima = function(codigo){

    if(codigo == 0)
        return 'https://openweathermap.org/img/wn/01d@2x.png'

    if(codigo >= 1 && codigo <= 3)
        return 'https://openweathermap.org/img/wn/02d@2x.png'

    if(codigo >= 45 && codigo <= 48)
        return 'https://openweathermap.org/img/wn/50d@2x.png'

    if(codigo >= 51 && codigo <= 67)
        return 'https://openweathermap.org/img/wn/10d@2x.png'

    if(codigo >= 71 && codigo <= 77)
        return 'https://openweathermap.org/img/wn/13d@2x.png'

    if(codigo >= 80 && codigo <= 82)
        return 'https://openweathermap.org/img/wn/09d@2x.png'

    if(codigo >= 95)
        return 'https://openweathermap.org/img/wn/11d@2x.png'

    return 'https://openweathermap.org/img/wn/03d@2x.png'
}

// Função responsável por retornar a descrição do clima
const getDescricaoClima = function(codigo){

    if(codigo == 0)
        return 'Céu Limpo'

    if(codigo >= 1 && codigo <= 3)
        return 'Parcialmente Nublado'

    if(codigo >= 45 && codigo <= 48)
        return 'Neblina'

    if(codigo >= 51 && codigo <= 67)
        return 'Chuva'

    if(codigo >= 71 && codigo <= 77)
        return 'Neve'

    if(codigo >= 80 && codigo <= 82)
        return 'Pancadas de Chuva'

    if(codigo >= 95)
        return 'Tempestade'

    return 'Nublado'
}

// Função responsável por preencher os dados principais da tela
const preencherClima = async function(cidade){

    try{

        const local = await getCidade(cidade)

        if(!local){
            alert('Cidade não encontrada.')
            return
        }

        const clima = await getClima(
            local.latitude,
            local.longitude
        )

        document.getElementById('cidade').textContent =
        local.name

        document.getElementById('temperatura').textContent =
        `${Math.round(clima.current.temperature_2m)}°`

        document.getElementById('descricao').textContent =
        getDescricaoClima(clima.current.weather_code)

        document.getElementById('sensacao-termica').textContent =
        `Sensação térmica ${Math.round(clima.current.apparent_temperature)}°`

        document.getElementById('temperatura-maxima').textContent =
        `↑ ${Math.round(clima.daily.temperature_2m_max[0])}°`

        document.getElementById('temperatura-minima').textContent =
        `↓ ${Math.round(clima.daily.temperature_2m_min[0])}°`

        document.getElementById('umidade').textContent =
        `${clima.current.relative_humidity_2m}%`

        document.getElementById('vento').textContent =
        `${Math.round(clima.current.wind_speed_10m)} km/h`

        document.getElementById('icone-principal').src =
        getIconeClima(clima.current.weather_code)

        document.getElementById('nascer-sol').textContent =
        new Date(clima.daily.sunrise[0]).toLocaleTimeString(
            'pt-BR',
            {
                hour: '2-digit',
                minute: '2-digit'
            }
        )

        document.getElementById('por-sol').textContent =
        new Date(clima.daily.sunset[0]).toLocaleTimeString(
            'pt-BR',
            {
                hour: '2-digit',
                minute: '2-digit'
            }
        )

        criarPrevisaoHoraria(clima)
        criarPrevisaoSemanal(clima)
        criarGraficoTemperatura(clima)

    }catch(error){

        alert('Erro ao carregar dados climáticos.')
    }
}

// Função responsável por criar os cards da previsão horária
const criarPrevisaoHoraria = function(clima){

    const container = document.querySelector('.container-horarios')

    container.replaceChildren()

    for(let i = 0; i < 24; i++){

        const card = document.createElement('div')
        card.className = 'card-hora'

        const hora = document.createElement('p')
        hora.textContent = `${i}h`

        const icone = document.createElement('img')
        icone.src = getIconeClima(
            clima.hourly.weather_code[i]
        )
        icone.alt = 'Ícone do clima'

        const temperatura = document.createElement('span')
        temperatura.textContent =
        `${Math.round(clima.hourly.temperature_2m[i])}°`

        card.append(
            hora,
            icone,
            temperatura
        )

        container.append(card)
    }
}

// Função responsável por criar os cards da previsão semanal
const criarPrevisaoSemanal = function(clima){

    const container = document.getElementById('previsao-semanal')

    document
        .querySelectorAll('.card-semana')
        .forEach(function(card){
            card.remove()
        })

    for(let i = 0; i < 7; i++){

        const card = document.createElement('div')
        card.className = 'card-semana'

        const dia = document.createElement('span')

        dia.textContent =
        i == 0
            ? 'Hoje'
            : `Dia ${i + 1}`

        const icone = document.createElement('img')

        icone.src = getIconeClima(
            clima.daily.weather_code[i]
        )

        icone.alt = 'Ícone do clima'

        const temperaturas = document.createElement('div')
        temperaturas.className = 'temperatura-semana'

        const minima = document.createElement('span')
        minima.textContent =
        `${Math.round(clima.daily.temperature_2m_min[i])}°`

        const maxima = document.createElement('span')
        maxima.textContent =
        `${Math.round(clima.daily.temperature_2m_max[i])}°`

        temperaturas.append(
            minima,
            maxima
        )

        card.append(
            dia,
            icone,
            temperaturas
        )

        container.append(card)
    }
}

// Função responsável por pesquisar uma cidade
const pesquisarCidade = function(){

    const cidade =
    document.getElementById('input-pesquisa').value.trim()

    if(cidade != '')
        preencherClima(cidade)
}

// Evento responsável por pesquisar ao pressionar ENTER
document
    .getElementById('input-pesquisa')
    .addEventListener('keypress', function(event){

        if(event.key == 'Enter')
            pesquisarCidade()
    })

// Carrega São Paulo ao abrir o sistema
preencherClima('São Paulo')


// Variável global para armazenar o gráfico
let grafico = null


// Função responsável por criar o gráfico de temperatura
const criarGraficoTemperatura = function(clima){

    const contexto =
    document.getElementById('grafico-temperatura')

    const horas = []
    const temperaturas = []

    for(let i = 0; i < 24; i++){

        horas.push(`${i}h`)

        temperaturas.push(
            clima.hourly.temperature_2m[i]
        )
    }

    if(grafico)
        grafico.destroy()

    grafico = new Chart(contexto, {

        type: 'line',

        data: {
            labels: horas,

            datasets: [{
                label: 'Temperatura °C',
                data: temperaturas,
                borderColor: '#6677f0',
                backgroundColor: 'rgba(102,119,240,0.2)',
                borderWidth: 3,
                tension: 0.4,
                fill: true
            }]
        },

        options: {

            responsive: true,

            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            },

            scales: {

                x: {
                    ticks: {
                        color: '#ffffff'
                    },

                    grid: {
                        color: 'rgba(255,255,255,0.1)'
                    }
                },

                y: {
                    ticks: {
                        color: '#ffffff'
                    },

                    grid: {
                        color: 'rgba(255,255,255,0.1)'
                    }
                }
            }
        }
    })
}