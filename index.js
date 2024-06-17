const symbolInput = document.querySelector('#symbol');
const suggestionsBox = document.querySelector('#suggestions');
const stockList = document.querySelector('#stock-list');
const form = document.getElementById('myForm');
const stockChart = document.getElementById('stockChart').getContext('2d');
const stockName = document.getElementById('stock-name');
const stockPrice = document.getElementById('stock-price');
const stockChange = document.getElementById('stock-change');
const tabs = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
let chart;

const apiKey = 'd4706445-df94-47ba-aa97-6cfb184e4d13';

function fetchTopStocks() {
    fetch('https://www.alphavantage.co/query?function=SECTOR&apikey=EBEDU7X5Z0G444A0')
        .then(response => response.json())
        .then(data => {
            const stocks = data['Rank A: Real-Time Performance'];
            if (!stocks) {
                stockList.innerHTML = '<tr class="error"><td colspan="6">Erro ao obter dados de ações</td></tr>';
                return;
            }
            let html = '';
            let labels = [];
            let dataPoints = [];
            for (let i = 0; i < 10; i++) {
                const symbol = Object.keys(stocks)[i];
                const change = stocks[symbol];
                const changeColor = parseFloat(change) >= 0 ? 'green' : 'red';
                labels.push(symbol);
                dataPoints.push(parseFloat(change));
                html += `
                    <tr>
                        <td>${symbol}</td>
                        <td style="color: ${changeColor}">${change}</td>
                    </tr>
                `;
            }
            stockList.innerHTML = html;
            renderChart(labels, dataPoints);
        })
        .catch(error => {
            console.error(error);
            stockList.innerHTML = '<tr class="error"><td colspan="6">Erro ao obter dados de ações</td></tr>';
        });
}

function fetchStockData(symbol) {
    if (!symbol || symbol.trim() === '') {
        fetchTopStocks();
        return;
    }

    fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=EBEDU7X5Z0G444A0`)
        .then(response => response.json())
        .then(data => {
            const quote = data['Global Quote'];
            if (quote && quote['05. price']) {
                const price = quote['05. price'];
                const changePercent = quote['10. change percent'].replace('%', '');
                const changeColor = parseFloat(changePercent) >= 0 ? 'green' : 'red';
                stockName.textContent = `Ação: ${symbol}`;
                stockPrice.textContent = `Preço Atual: $${price}`;
                stockChange.textContent = `Variação: ${changePercent}%`;
                stockChange.style.color = changeColor;

                const html = `
                    <tr>
                        <td>${symbol}</td>
                        <td style="color: ${changeColor}">${changePercent}</td>
                    </tr>
                `;
                stockList.innerHTML = html;
                renderChart([symbol], [parseFloat(changePercent)]);
                fetchHistoricalData(symbol);
            } else {
                stockName.textContent = '';
                stockPrice.textContent = '';
                stockChange.textContent = '';
                stockList.innerHTML = '<tr class="error"><td colspan="6">Símbolo Inválido</td></tr>';
            }
        })
        .catch(error => {
            console.error(error);
            stockName.textContent = '';
            stockPrice.textContent = '';
            stockChange.textContent = '';
            stockList.innerHTML = '<tr class="error"><td colspan="6">Erro ao obter dados da ação</td></tr>';
        });
}

function fetchHistoricalData(symbol) {
    fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=EBEDU7X5Z0G444A0`)
        .then(response => response.json())
        .then(data => {
            const timeSeries = data['Time Series (Daily)'];
            if (!timeSeries) {
                stockList.innerHTML = '<tr class="error"><td colspan="6">Erro ao obter dados históricos</td></tr>';
                return;
            }

            let html = '';
            const labels = [];
            const dataPoints = [];

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

            stockList.innerHTML = html;
            renderChart(labels, dataPoints);
        })
        .catch(error => {
            console.error(error);
            stockList.innerHTML = '<tr class="error"><td colspan="6">Erro ao obter dados históricos</td></tr>';
        });
}

function renderChart(labels, data) {
    if (chart) {
        chart.destroy();
    }
    chart = new Chart(stockChart, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Preço de Fechamento',
                data: data,
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
}

function showSuggestions() {
    const query = symbolInput.value.trim().toUpperCase();
}
