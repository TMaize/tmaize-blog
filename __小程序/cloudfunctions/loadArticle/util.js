const cheerio = require('cheerio');
const request = require('request');

const site = 'http://blog.tmaize.net'

const parseList = async() => {
    return new Promise((resolve, reject) => {
        request(site, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var articles = [];
                var $ = cheerio.load(body);
                $('.main').find('li').each(function(i, v) {
                    var item = $(v);
                    var time = item.find('.time').text();
                    var title = '';
                    var url = '';
                    var category = []
                    item.find('a').each(function(ii, vv) {
                        if (ii == 0) {
                            title = $(vv).text()
                            url = $(vv).attr('href')
                        } else {
                            category.push($(vv).text())
                        }
                    })
                    articles.push({
                        url,
                        title,
                        time,
                        category
                    })
                })
                resolve(articles)
            } else {
                reject('index.html失败')
            }
        });
    })
}

const parseDetail = async id => {
    return new Promise((resolve, reject) => {
        request(encodeURI(site + id), function(error, response, body) {
            if (!error && response.statusCode == 200) {
                let $ = cheerio.load(body, {
                    decodeEntities: false //html() 方法不转换中文字符
                });
                resolve($.html('.content'))
            } else {
                reject('爬取' + id + '失败')
            }
        });
    })
}

const test = async() => {
    let articles = await parseList()
    for (let item of articles) {
        let cotent = await parseDetail(item.url)
        item.content = cotent
        console.log(item.url)
    }
    return articles
}

// test().then(data => {
//     console.log(data[1].content)
// })

module.exports = {
    parseList,
    parseDetail
}