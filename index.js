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
    const browser = await puppeteer.launch({ headless: true, userDataDir: './zee' });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1200,
        height: 800
    });
    const get = async (ASIN) => {
        try {
            let url = `https://www.amazon.in/dp/${ASIN}/#aod`
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
            await page.waitFor(1000)

            let buybox = await amazonFunctions.findPinnedAOD(page)
            let offers = await amazonFunctions.findAODOfferList(page)

            // console.log("buybox")
            // console.log(buybox)
            newCSVRow.ASIN = ASIN
            newCSVRow.url = url

            newCSVRow.buy_box_seller_name = buybox.name
            newCSVRow.buy_box_seller_price = buybox.price
            // console.log(lowestPrice, parseInt(buybox.price.replace(/[^\d.-]/g, '')))

            if (lowestPrice > parseInt(buybox.price.replace(/[^\d.-]/g, ''))) {
                newCSVRow[`lowest_price_seller_name`] = buybox.name
                newCSVRow[`lowest_price_seller_price`] = parseInt(buybox.price.replace(/[^\d.-]/g, ''))
                lowestPrice = parseInt(buybox.price.replace(/[^\d.-]/g, ''))
                // console.log('newlow price', parseInt(buybox.price.replace(/[^\d.-]/g, '')))
            }
            // console.log(newCSVRow)
            // console.log('offers')
            // console.log(offers)
            offers.forEach((offer, index) => {
                // console.log(`seller_${index + 2}_name`)
                newCSVRow[`seller_${index + 2}_name`] = offer.name
                // console.log(newCSVRow)
                newCSVRow[`seller_${index + 2}_price`] = offer.price
                // console.log(lowestPrice, parseInt(offer.price.replace(/[^\d.-]/g, '')))
                if (lowestPrice > parseInt(offer.price.replace(/[^\d.-]/g, ''))) {
                    newCSVRow[`lowest_price_seller_name`] = offer.name
                    newCSVRow[`lowest_price_seller_price`] = parseInt(offer.price.replace(/[^\d.-]/g, ''))
                    lowestPrice = parseInt(buybox.price.replace(/[^\d.-]/g, ''))

                    // console.log('newlow price', parseInt(offer.price.replace(/[^\d.-]/g, '')))

                }
            })
            // console.log(newCSVRow)


            // console.log("Finish")
            // console.log("")
            // console.log("")
            await page.waitFor(1000)
            newCSV.push(newCSVRow)
            return 1
        } catch (e) {
            console.log(e)
        }
    }
    await bluebird.map(ASINS, async (asin) => {
        await get(asin)

    }, { concurrency: 3 });
    const csv = new ObjectsToCsv(newCSV)
    await csv.toDisk('./list.csv')
    console.log("Finish")
    // for (let asin of ASINS) {
    //     let url = `https://www.amazon.in/dp/${asin}/#aod`
    //     await get(url)

    // await page.waitFor(1000)
    // }


})()

