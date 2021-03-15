const amazonFunctions = require('./amazonFunctions.js');
const ObjectsToCsv = require('objects-to-csv')

const puppeteer = require('puppeteer');
var bluebird = require("bluebird");
var log = require('loglevel');
log.setLevel('info');

// return 1;
let newCSV = [];
(async () => {
    const csvInputFilePath = './input.csv'
    const csvToJson = require('csvtojson')

    const csvData = await csvToJson().fromFile(csvInputFilePath);
    let ASINS = csvData.map(val => val.ASIN)
    const browser = await puppeteer.launch({ headless: true, userDataDir: './n' });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1200,
        height: 800
    });
    const get = async (ASIN) => {
        try {
            let url = `https://www.amazon.in/dp/${ASIN}/`
            let lowestPrice = 99999999999;
            let newCSVRow = {
                ASIN: '',
                url: '',
                buy_box_seller_name: '',
                buy_box_seller_price: '',
                lowest_price_seller_name: '',
                lowest_price_seller_price: '',
                seller_2_name: '',
                seller_2_price: '',
                seller_3_name: '',
                seller_3_price: '',
                seller_4_name: '',
                seller_4_price: '',
                seller_5_name: '',
                seller_5_price: '',
                seller_6_name: '',
                seller_6_price: '',
            }
            let seller_count = 0;
            const page = await browser.newPage();
            await page.setViewport({
                width: 1200,
                height: 800
            });
            console.log('EXTRACTING ', url)
            let x = await page.goto(url)
            viewProfileButtonSelector = '#olp_feature_div > div:nth-child(4) > span:nth-child(1) > a:nth-child(1) > span:nth-child(1)'
            await page.waitForSelector(viewProfileButtonSelector)
            let button = await page.$(viewProfileButtonSelector)
            await button.click()

            let buybox = await amazonFunctions.findPinnedAOD(page)
            let offers = await amazonFunctions.findAODOfferList(page)

            newCSVRow.ASIN = ASIN
            newCSVRow.url = url

            newCSVRow.buy_box_seller_name = buybox.name
            newCSVRow.buy_box_seller_price = buybox.price

            if (lowestPrice > parseInt(buybox.price.replace(/[^\d.-]/g, ''))) {
                newCSVRow[`lowest_price_seller_name`] = buybox.name
                newCSVRow[`lowest_price_seller_price`] = parseInt(buybox.price.replace(/[^\d.-]/g, ''))
                lowestPrice = parseInt(buybox.price.replace(/[^\d.-]/g, ''))
            }
            offers.forEach((offer, index) => {
                newCSVRow[`seller_${index + 2}_name`] = offer.name
                newCSVRow[`seller_${index + 2}_price`] = offer.price
                if (lowestPrice > parseInt(offer.price.replace(/[^\d.-]/g, ''))) {
                    newCSVRow[`lowest_price_seller_name`] = offer.name
                    newCSVRow[`lowest_price_seller_price`] = parseInt(offer.price.replace(/[^\d.-]/g, ''))
                    lowestPrice = parseInt(buybox.price.replace(/[^\d.-]/g, ''))
                }
            })
            // await page.waitFor(1000)
            newCSV.push(newCSVRow)
            await page.close()
            return 1
        } catch (e) {
            console.log(e)
        }
    }
    await bluebird.map(ASINS, async (asin) => {
        await get(asin)
    }, { concurrency: 5 });
    const csv = new ObjectsToCsv(newCSV)
    await csv.toDisk('./output.csv')
    console.log("Finish")
})()

