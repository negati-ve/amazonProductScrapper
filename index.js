const amazonFunctions = require("./amazonFunctions.js");
const ObjectsToCsv = require("objects-to-csv");
const puppeteer = require("puppeteer");
// const StealthPlugin = require("puppeteer-extra-plugin-stealth");
// puppeteer.use(StealthPlugin());
var bluebird = require("bluebird");
var log = require("loglevel");
log.setLevel("info");
var count = 0;
var skip = 0;
let newCSV = [];

(async () => {
  const csvInputFilePath = "./input.csv";
  const csvToJson = require("csvtojson");

  const csvData = await csvToJson().fromFile(csvInputFilePath);
  let ASINS = csvData.map((val) => val.ASIN);

  const get = async (ASIN, currentCount) => {
    try {
      let start = new Date();

      let browser = await puppeteer.launch({
        headless: true,
        // ignoreHTTPSErrors: true,
        userDataDir: "./data",
        args: [
          // "--no-sandbox",
          // "--disable-setuid-sandbox",
          // "--disable-infobars",
          // "--window-position=0,0",
          // "--ignore-certifcate-errors",
          // "--ignore-certifcate-errors-spki-list",
          '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"',
        ],
      });

      let productUrl = `https://www.amazon.in/dp/${ASIN}/#aod`;
      let url = `https://www.amazon.in/gp/aod/ajax/ref=dp_aod_NEW_mbc?asin=${ASIN}`;
      let lowestPrice = 99999999999;
      let newCSVRow = {
        ASIN: "",
        url: "",
        buy_box_seller_name: "",
        buy_box_seller_price: "",
        lowest_price_seller_name: "",
        lowest_price_seller_price: "",
        seller_2_name: "",
        seller_2_price: "",
        seller_3_name: "",
        seller_3_price: "",
        seller_4_name: "",
        seller_4_price: "",
        seller_5_name: "",
        seller_5_price: "",
        seller_6_name: "",
        seller_6_price: "",
      };
      let seller_count = 0;
      const page = await browser.newPage();

      await page.setViewport({
        width: 1080,
        height: 1080,
      });
      // await page.setRequestInterception(true);

      // page.on("request", (req) => {
      //   if (
      //     req.resourceType() == "stylesheet" ||
      //     req.resourceType() == "font" ||
      //     req.resourceType() == "image"
      //   ) {
      //     req.abort();
      //   } else {
      //     req.continue();
      //   }
      // });

      let x = await page.goto(url);

      let asinMatch = await amazonFunctions.checkIfAsinMatch(page, ASIN);
      if (!asinMatch) {
        console.log(`ASIM MISMATCH for ${ASIN}`);
        return 0;
      }
      let buybox = await amazonFunctions.findPinnedAOD(page);
      let offers = await amazonFunctions.findAODOfferList(page);

      newCSVRow.ASIN = ASIN;
      newCSVRow.url = productUrl;

      newCSVRow.buy_box_seller_name = buybox.name;
      newCSVRow.buy_box_seller_price = buybox.price;

      if (lowestPrice > parseInt(buybox.price.replace(/[^\d.-]/g, ""))) {
        newCSVRow[`lowest_price_seller_name`] = buybox.name;
        newCSVRow[`lowest_price_seller_price`] = parseInt(
          buybox.price.replace(/[^\d.-]/g, "")
        );
        lowestPrice = parseInt(buybox.price.replace(/[^\d.-]/g, ""));
      }
      offers.forEach((offer, index) => {
        newCSVRow[`seller_${index + 2}_name`] = offer.name;
        newCSVRow[`seller_${index + 2}_price`] = offer.price;
        if (lowestPrice > parseInt(offer.price.replace(/[^\d.-]/g, ""))) {
          newCSVRow[`lowest_price_seller_name`] = offer.name;
          newCSVRow[`lowest_price_seller_price`] = parseInt(
            offer.price.replace(/[^\d.-]/g, "")
          );
          lowestPrice = parseInt(buybox.price.replace(/[^\d.-]/g, ""));
        }
      });
      await page.waitFor(1000);
      newCSV.push(newCSVRow);
      let csv = new ObjectsToCsv([newCSVRow]);
      await csv.toDisk("./output.csv", { append: true });
      let end = new Date() - start;
      console.log(currentCount, "EXTRACTED ", ASIN);
      console.info("Execution time: %dms", end);
      await page.close();
      await browser.close();
      return 1;
    } catch (e) {
      console.log("FAILED", currentCount, ASIN);
      console.log(e);
    }
  };
  await bluebird.map(
    ASINS,
    async (asin) => {
      count = count + 1;
      if (count < skip) {
        return;
      }
      await get(asin, count);
    },
    { concurrency: 50 }
  );

  console.log("Finish");
})();
