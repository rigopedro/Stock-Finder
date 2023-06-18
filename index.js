const symbolInput = document.querySelector('#symbol');
const stockList = document.querySelector('#stock-list');
const form = document.getElementById('myForm');



// Função para mostrar as ações top 10
function fetchTopStocks() {
    // Data do api
    fetch('https://www.alphavantage.co/query?function=SECTOR&apikey=EBEDU7X5Z0G444A0').then(response => response.json()).then(data => {
        const stocks = data['Rank A: Real-Time Performance']
        let html = '';
        // Loop nas ações e gerar HTML pra cada uma
        for (let i = 0; i < 10; i++) {
            const symbol = Object.keys(stocks)[i]
            const change = stocks[symbol];
            const changeColor = parseFloat(change) >= 0 ? 'green' : 'red';
            html += `
            <li>
            <span class="symbol">${symbol}</span>
            <span class="change" style="color: ${changeColor}">${change}</span>
            </li>
             `;
        }
        // Update na lista de ações
        stockList.innerHTML = html;
    }).catch(error => console.error(error));
}

function fetchStockData(symbol) {
    if (!symbol || symbol?.trim() === '') {
        fetchTopStocks();
        return;
    }

    fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=EBEDU7X5Z0G444A0`).then(response => response.json()).then(data => {
        const quote = data['Global Quote'];
        if (quote && quote['10. change percent']) {
            const changePercent = quote['10. change percent'].replace('%', '');
            const changeColor = parseFloat(changePercent) >= 0 ? 'green' : 'red';
            const html = `
            <li>
            <span class="symbol">${symbol}</span>
            <span class="change" style="color: ${changeColor}">${changePercent}</span>
            </li>
             `;
            stockList.innerHTML = html;
        } else {
            stockList.innerHTML = '<li class="error">Simbolo Inválido</li>';
        }
    }).catch(error => console.error(error));


}

// Display top 10 on load page
fetchTopStocks();

// Handle from submission
form.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent page reload 


    // Get symbol entered by user and convert it to uppercase  
    let symbol = document.forms["myForm"]["search"].value?.trim()?.toUpperCase() // Save value of input
    fetchStockData(symbol);
});

