function main() {
  var request = new XMLHttpRequest();
  request.open('GET', "https://api.coinmarketcap.com/v1/ticker/?limit=300", true);
  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      var resp = JSON.parse(request.responseText);
      processData(resp);
    } else {
      console.log('We reached our target server, but it returned an error')
    }
  };
  request.onerror = function() {
    console.log('There was a connection error of some sort')
  };
  request.send();
}

function processData(cmcCoins) {
  var btcPrice = parseFloat(cmcCoins[0]['price_usd']);
  var longCoins = getLocalCoins('#longCoins');
  var shortCoins = getLocalCoins('#shortCoins');
  var longCoinsInfo = constructCoinList(cmcCoins, longCoins, btcPrice);
  var shortCoinsInfo = constructCoinList(cmcCoins, shortCoins, btcPrice);
  var totalLongBtc = sumCoins(longCoinsInfo, 'amountBtc');
  var totalShortBtc = sumCoins(shortCoinsInfo, 'amountBtc');
  var totalBtc = totalLongBtc + totalShortBtc;
  var totalLongUsd = sumCoins(longCoinsInfo, 'amountUsd');
  var totalShortUsd = sumCoins(shortCoinsInfo, 'amountUsd');
  var totalUsd = totalLongUsd + totalShortUsd;
  var percentLong = (totalLongBtc / (totalLongBtc + totalShortBtc)) * 100;
  var percentShort = (totalShortBtc / (totalLongBtc + totalShortBtc)) * 100;
  var html = createHtml(percentLong, percentShort, totalBtc, totalUsd);
  renderHtml(html, 'info');
}

function getLocalCoins(selector) {
  var a = [];
  var coinTable = document.querySelectorAll(selector)[0];
  for (var i = 0, row; row = coinTable.rows[i]; i++) {
    var d = {};
    d.symbol = row.cells[0].innerText;
    d.amount = parseFloat(row.cells[1].getElementsByTagName("input")[0].value);
    a.push(d);
  };
  return a;
}

function constructCoinList(cmcCoins, localCoins, btcPrice) {
  var coinList = [];
  localCoins.forEach(function(localCoin) {
    cmcCoins.forEach(function(cmcCoin) {
      if (localCoin.symbol == cmcCoin.symbol) {
        localCoin.priceUsd = parseFloat(cmcCoin.price_usd);
        localCoin.priceBtc = parseFloat(cmcCoin.price_btc);
        localCoin.amountBtc = localCoin.amount * localCoin.priceBtc;
        localCoin.amountUsd = localCoin.amountBtc * btcPrice;
        coinList.push(localCoin);
      };
    });
  });
  return coinList
}

function sumCoins(coinInfo, amount) {
  a = [];
  coinInfo.forEach(function(coin) {
    a.push(coin[amount]);
  });
  return a.reduce(function(a, b) { return a + b; }, 0);
}

function createHtml(a, b, c, d) {
  var html = `
    <th scope="row">Long (%)</th>
    <th scope="row">Short (%)</th>
    <th scope="row">Total (BTC)</th>
    <th scope="row">Total ($)</th>
  `;
  html += '<tr>'
  html += '<td>' + a + '</td>';
  html += '<td>' + b + '</td>';
  html += '<td>' + c + '</td>';
  html += '<td>' + d + '</td>';
  html += '</tr>'
  return html;
}

function renderHtml(html, id) {
  document.getElementById(id).innerHTML = '';
  document.getElementById(id).innerHTML = html;
}
