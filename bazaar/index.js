let bazaar = {}, items = {}

const $ = {
    id: (id) => document.getElementById(id)
}

const pushError = (message) => {

}

window.onload = async _ => {
    setTimeout(_ => $.id('loading_too_low').hidden = false, 10 * 1000);
    $.id('loading_status').innerText = 'Downloading Bazaar Data'
    bazaar = await fetch('https://api.hypixel.net/skyblock/bazaar')
        .then(res => res.json())
        .then(json => {
            if (!json.success) pushError('Fail to get bazaar data')
            return json.products
        })
        .catch(err => console.log(err))
    $.id('loading_status').innerText = 'Downloading Items Data'
    items = await fetch('https://api.hypixel.net/resources/skyblock/items')
        .then(res => res.json())
        .then(json => {
            if (!json.success) pushError('Fail to get items data')
            return json.items.reduce((p, c) => {
                if (bazaar[c.id] != null)
                    p[c.id] = c
                return p
            }, {})
        })
        .catch(err => console.log(err))
    $.id('loading_status').innerText = 'Building HTML'
    showList(items)
    $.id('loading_status').innerText = 'Loading Complete'
    $.id('loading').style.opacity = 0
    setTimeout(() => {
        $.id('loading').style.width = $.id('loading').style.height = '0px'
    }, 1000);
}

const find = (id) => {
    return {
        bz: bazaar[id],
        item: items[id]
    }
}

const search = _ => {
    let value = $.id('key').value
    showList(Object.keys(items).reduce((p, c) => {
        if (items[c].name.toLowerCase().indexOf(value.toLowerCase()) != -1)
            p[c] = items[c]
        return p
    }, {}))
}

const showList = (itemList) => {
    console.log(itemList)
    $.id('items').innerHTML = ""
    Object.keys(itemList).forEach(x => {
        if (itemList[x].material == 'SKULL_ITEM') {
            let skull = itemList[x].skin
            let skin_uuid = JSON.parse(window.atob(skull)).profileId
            $.id('items').innerHTML += `<div class="item" onclick="select('${itemList[x].id}')">
            <img class="item_img" src="https://crafatar.com/renders/head/${skin_uuid}">
            <div class="item_name">${formatColor('§f' + itemList[x].name)}</div>
            </div>`
        } else {
            $.id('items').innerHTML += `<div class="item">
            <img class="item_img">
            <div class="item_name">${formatColor('§f' + itemList[x].name)}</div>
            </div>`
        }
    })
}

const select = (id) => {
    let item = items[id]
    if (item.material == 'SKULL_ITEM') {
        let skull = item.skin
        let skin_uuid = JSON.parse(window.atob(skull)).profileId
        $.id('selected_item').innerHTML = `\<img class="item_img" src="https://crafatar.com/renders/head/${skin_uuid}">
        <div class="item_name">${formatColor('§f' + item.name)}</div>`
    } else {
        $.id('selected_item').innerHTML = `\<img class="item_img">
        <div class="item_name">${formatColor('§f' + item.name)}</div>`
    }
    let price = bazaar[id]
    $.id('price').innerHTML = `BUY : ${Math.round(price.quick_status.buyPrice * 100) / 100}<br>
    SELL : ${Math.round(price.quick_status.sellPrice * 100) / 100}`
    $.id('selected').hidden = false
}

//color parser
const colors = [
    '#000000', '#0000AA', '#00AA00', '#00AAAA', '#AA0000', '#AA00AA', '#FFAA00', '#AAAAAA',
    '#555555', '#5555FF', '#55FF55', '#55FFFF', '#FF5555', '#FF55FF', '#FFFF55', '#FFFFFF'
];
const formatColor = (data) => {
    if (data == null) return 'Fail to get';
    return data.split('').reduce((ret, char, index, arr) =>
        ret += char == '§' ? '</span>' : arr[index - 1] == '§' ? '<span style="color:' + colors[parseInt(char, 16)] + '">' : char,
        '<span style="color:' + colors[0] + '">') + '</span>';
}