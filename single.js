const amazonFunctions = require('./amazonFunctions.js');
const ObjectsToCsv = require('objects-to-csv')
const puppeteer = require('puppeteer');
var bluebird = require("bluebird");
// var Xvfb = require('xvfb');
var log = require('loglevel');
log.setLevel('info');
var count = 0;
// return 1;
var skip = 0;
let newCSV = [];
// var Xvfb = require('xvfb');
// var xvfb = new Xvfb();
// xvfb.startSync();

// // code that uses the virtual frame buffer here

// xvfb.stopSync();
// the Xvfb is stopped
(async () => {

    const csvInputFilePath = './input.csv'
    const csvToJson = require('csvtojson')

    const csvData = await csvToJson().fromFile(csvInputFilePath);
    let ASINS = csvData.map(val => val.ASIN)

    const get = async (ASIN, currentCount) => {
        try {
            let start = new Date()

            let browser = await puppeteer.launch({
                headless: true, args: [
                    '--no-sandbox',
                    '--headless',
                    '--disable-gpu',
                    '--window-size=1920x1080'
                ]
            });

            // const page = await browser.newPage();
            // await page.setViewport({
            //     width: 1200,
            //     height: 800
            // });


            let productUrl = `https://www.amazon.in/dp/${ASIN}/#aod`
            let url = `https://www.amazon.in/gp/aod/ajax/ref=dp_aod_NEW_mbc?asin=${ASIN}&m=&pinnedofferhash=&qid=&smid=&sourcecustomerorglistid=&sourcecustomerorglistitemid=&sr=&pc=dp`
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
                width: 1080,
                height: 1080
            });
            // await page.setRequestInterception(true);

            // page.on('request', (req) => {
            //     if (req.resourceType() == 'font' || req.resourceType() == 'image') {
            //         req.abort();
            //     }
            //     else {
            //         req.continue();
            //     }
            // }); 

            // console.log()
            // console.log(count, 'EXTRACTING ', url)
            let x = await page.goto(url)
            // viewProfileButtonSelector = '#olp_feature_div > div:nth-child(4) > span:nth-child(1) > a:nth-child(1) > span:nth-child(1)'
            // await page.waitForSelector(viewProfileButtonSelector)
            // let button = await page.$(viewProfileButtonSelector)
            // await button.click()
            // console.log(x)
            let buybox = await amazonFunctions.findPinnedAOD(page)
            let offers = await amazonFunctions.findAODOfferListDirect(page)
            console.log(offers)
            newCSVRow.ASIN = ASIN
            newCSVRow.url = productUrl

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
            await page.waitFor(1000)
            newCSV.push(newCSVRow)
            const csv = new ObjectsToCsv(newCSV)
            await csv.toDisk('./output.csv', { append: true })
            let end = new Date() - start
            console.log(currentCount, 'EXTRACTED ', url, newCSVRow)
            console.info('Execution time: %dms', end)
            await page.close()
            await browser.close();
            return 1
        } catch (e) {
            // await page.close()
            // await browser.close();
            console.log('FAILED', currentCount)
            console.log(e)
        }
    }
    get('B08TVZVH5G', 1)

})()

