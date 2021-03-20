var log = require('loglevel');
log.setLevel('debug')
findPinnedAOD = async (amazonPage) => {
    try {
        let name;
        let price;
        // amazonPage.waitFor(1000)
        const noBuyBox = await amazonPage.$$('[class="a-offscreen"]');
        // console.log(noBuyBox, noBuyBox != null, noBuyBox.length == 0)
        if (noBuyBox != null && noBuyBox.length == 0) {
            console.log("no buybox", noBuyBox)
            return { name: 'not avaiable', price: 'not available' };
        }
        await amazonPage.waitForXPath('//*[@id="aod-pinned-offer-additional-content"]');
        const pinnedAOD = await amazonPage.$$('[id="aod-pinned-offer"]');
        for (let AOD of pinnedAOD) {
            price = await AOD.$eval('.a-offscreen', el => el.innerText);
            name = await AOD.$eval('#aod-offer-soldBy > div > div >  div:nth-child(2) >a', el => el.innerText);
        }
        // await amazonPage.waitFor(1000)
        return { name, price }
    } catch (e) {
        console.log(e)
    }
}
findPinnedAODDirect = async (amazonPage) => {
    try {
        let name;
        let price;
        // amazonPage.waitFor(1000)
        const noBuyBox = await amazonPage.$$('[class="a-offscreen"]');
        if (noBuyBox != null && noBuyBox.length != 0) {
            console.log("no buybox", noBuyBox)
            return { name: 'NA', price: 'NA' };
        }
        await amazonPage.waitForXPath('//*[@id="aod-pinned-offer-additional-content"]');
        const pinnedAOD = await amazonPage.$$('[id="aod-pinned-offer"]');
        for (let AOD of pinnedAOD) {
            price = await AOD.$eval('.a-offscreen', el => el.innerText);
            name = await AOD.$eval('#aod-offer-soldBy > div > div >  div:nth-child(2) >a', el => el.innerText);
        }
        // await amazonPage.waitFor(1000)
        return { name, price }
    } catch (e) {
        console.log(e)
    }
}

findAODOfferList = async (amazonPage) => {
    try {
        let offers = []
        await amazonPage.waitForXPath('//*[@id="aod-container"]');
        const noOffers = await amazonPage.$$('[class="aod-no-offer-normal-font"]');

        if (noOffers != null && noOffers.length != 0) {
            console.log("no offers", noOffers)
            offers.push({ name: "NA", price: "NA" })
            return offers;
        }
        const pinnedAOD = await amazonPage.$$('[id="aod-offer"]');
        for (let AOD of pinnedAOD) {
            let price;
            let name;
            price = await AOD.$eval('.a-offscreen', el => el.innerText);
            name = await AOD.$eval('#aod-offer-soldBy > div > div >  div:nth-child(2) >a', el => el.innerText);
            offers.push({ name, price })
        }
        return offers
    } catch (e) {
        console.log(e)
    }
}

findAODOfferListDirect = async (amazonPage) => {
    try {
        let offers = []
        await amazonPage.waitForXPath('//*[@id="aod-container"]');
        const noOffers = await amazonPage.$$('[class="aod-no-offer-normal-font"]');
        if (noOffers != null && noOffers.length == 0) {
            console.log("no offers", noOffers)
            return offers;
        }

        const pinnedAOD = await amazonPage.$$('[id="aod-offer"]');
        for (let AOD of pinnedAOD) {
            let price;
            let name;
            price = await AOD.$eval('.a-offscreen', el => el.innerText);
            name = await AOD.$eval('#aod-offer-soldBy > div > div >  div:nth-child(2) >a', el => el.innerText);
            offers.push({ name, price })
        }
        return offers
    } catch (e) {
        console.log(e)
    }
}
module.exports = {
    findPinnedAOD,
    findAODOfferList,
    findAODOfferListDirect
}