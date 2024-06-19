const symbolInput = document.querySelector('#symbol');
const suggestionsBox = document.querySelector('#suggestions');
const form = document.getElementById('myForm');
const stockChartCtx = document.getElementById('stockChart').getContext('2d');
const cryptoChartCtx = document.getElementById('cryptoChart').getContext('2d');
const indicesChartCtx = document.getElementById('indicesChart').getContext('2d');
const commoditiesChartCtx = document.getElementById('commoditiesChart').getContext('2d');
const currenciesChartCtx = document.getElementById('currenciesChart').getContext('2d');
const tabs = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

let stockChart, cryptoChart, indicesChart, commoditiesChart, currenciesChart;

document.addEventListener('DOMContentLoaded', function () {
    loadDefaultData();
    tabs.forEach(tab => tab.addEventListener('click', handleTabSwitch));
});

function loadDefaultData() {
    fetchStockData('AAPL');
    fetchCryptoData('bitcoin');
}

form.addEventListener('submit', function (event) {
    event.preventDefault();
    const symbol = symbolInput.value.trim();
    const activeTab = document.querySelector('.tab-button.active').dataset.tab;
    if (activeTab === 'stocks') {
        fetchStockData(symbol);
    } else if (activeTab === 'crypto') {
        fetchCryptoData(symbol);
    }
    // FETCH DO RESTO AQUI!!!!!!!!!
});

function fetchStockData(symbol) {
    fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=EBEDU7X5Z0G444A0`)
        .then(response => response.json())
        .then(data => {
            const quote = data['Global Quote'];
            if (quote && quote['05. price']) {
                const price = quote['05. price'];
                const changePercent = quote['10. change percent'].replace('%', '');
                const changeColor = parseFloat(changePercent) >= 0 ? 'green' : 'red';
                document.getElementById('stock-name').textContent = `Ação: ${symbol}`;
                document.getElementById('stock-price').textContent = `Preço Atual: $${price}`;
                document.getElementById('stock-change').textContent = `Variação: ${changePercent}%`;
                document.getElementById('stock-change').style.color = changeColor;

                fetchHistoricalData(symbol, stockChartCtx, 'stockChart', data => renderChart('stockChart', stockChartCtx, data));
            } else {
                document.getElementById('stock-name').textContent = '';
                document.getElementById('stock-price').textContent = '';
                document.getElementById('stock-change').textContent = '';
                document.getElementById('stock-list').innerHTML = '<tr class="error"><td colspan="6">Símbolo Inválido</td></tr>';
            }
        })
        .catch(error => {
            console.error(error);
            document.getElementById('stock-list').innerHTML = '<tr class="error"><td colspan="6">Erro ao obter dados da ação</td></tr>';
        });
}

function fetchHistoricalData(symbol, chartContext, chartType, callback) {
    fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=EBEDU7X5Z0G444A0`)
        .then(response => response.json())
        .then(data => {
            const timeSeries = data['Time Series (Daily)'];
            const labels = [];
            const dataPoints = [];
            let html = '';
            Object.keys(timeSeries).slice(0, 30).forEach(date => {
                const dayData = timeSeries[date];
                html += `
                    <tr>
                        <td>${date}</td>
                        <td>${dayData['1. open']}</td>
                        <td>${dayData['4. close']}</td>
                        <td>${dayData['2. high']}</td>
                        <td>${dayData['3. low']}</td>
                        <td>${dayData['5. volume']}</td>
                    </tr>
                `;
                labels.unshift(date);
                dataPoints.unshift(parseFloat(dayData['4. close']));
            });
            document.getElementById(`${chartType}-list`).innerHTML = html;
            callback({ labels, dataPoints });
        })
        .catch(error => {
            console.error(error);
            document.getElementById(`${chartType}-list`).innerHTML = '<tr class="error"><td colspan="6">Erro ao obter dados históricos</td></tr>';
        });
}

function fetchCryptoData(symbol) {
    fetch(`https://api.coingecko.com/api/v3/coins/${symbol}`)
        .then(response => response.json())
        .then(data => {
            if (data) {
                const price = data.market_data.current_price.usd;
                const changePercent = data.market_data.price_change_percentage_24h;
                const changeColor = changePercent >= 0 ? 'green' : 'red';
                document.getElementById('crypto-name').textContent = `Criptomoeda: ${data.name}`;
                document.getElementById('crypto-price').textContent = `Preço Atual: $${price}`;
                document.getElementById('crypto-change').textContent = `Variação: ${changePercent}%`;
                document.getElementById('crypto-change').style.color = changeColor;

                fetchCryptoHistoricalData(symbol, cryptoChartCtx, 'cryptoChart', data => renderChart('cryptoChart', cryptoChartCtx, data));
            } else {
                document.getElementById('crypto-name').textContent = '';
                document.getElementById('crypto-price').textContent = '';
                document.getElementById('crypto-change').textContent = '';
                document.getElementById('crypto-list').innerHTML = '<tr class="error"><td colspan="6">Símbolo Inválido</td></tr>';
            }
        })
        .catch(error => {
            console.error(error);
            document.getElementById('crypto-list').innerHTML = '<tr class="error"><td colspan="6">Erro ao obter dados da criptomoeda</td></tr>';
        });
}

function fetchCryptoHistoricalData(symbol, chartContext, chartType, callback) {
    fetch(`https://api.coingecko.com/api/v3/coins/${symbol}/market_chart?vs_currency=usd&days=30`)
        .then(response => response.json())
        .then(data => {
            const prices = data.prices;
            const labels = [];
            const dataPoints = [];
            let html = '';
            prices.forEach(price => {
                const date = new Date(price[0]).toISOString().split('T')[0];
                html += `
                    <tr>
                        <td>${date}</td>
                        <td>${price[1]}</td>
                    </tr>
                `;
                labels.push(date);
                dataPoints.push(price[1]);
            });
            document.getElementById(`${chartType}-list`).innerHTML = html;
            callback({ labels, dataPoints });
        })
        .catch(error => {
            console.error(error);
            document.getElementById(`${chartType}-list`).innerHTML = '<tr class="error"><td colspan="6">Erro ao obter dados históricos</td></tr>';
        });
}

function renderChart(chartType, chartContext, data) {
    if (window[chartType]) {
        window[chartType].destroy();
    }
    window[chartType] = new Chart(chartContext, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Preço de Fechamento',
                data: data.dataPoints,
                borderColor: 'blue',
                fill: false
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

function handleTabSwitch(event) {
    tabs.forEach(tab => tab.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    const tab = event.target;
    tab.classList.add('active');
    const contentId = tab.dataset.tab;
    document.getElementById(contentId).classList.add('active');

    if (contentId === 'stocks') {
        fetchStockData('AAPL');
    } else if (contentId === 'crypto') {
        fetchCryptoData('bitcoin');
    }
    // COLOCAR O RESTO QUE FALTA AQUI!!!
}
