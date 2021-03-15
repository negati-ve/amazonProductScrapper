var log = require('loglevel');
log.setLevel('debug')
findPinnedAOD = async (amazonPage) => {
    let name;
    let price;
    // amazonPage.waitFor(1000)
    await amazonPage.waitForXPath('//*[@id="aod-pinned-offer-additional-content"]');
    const pinnedAOD = await amazonPage.$$('[id="aod-pinned-offer"]');
    for (let AOD of pinnedAOD) {
        price = await AOD.$eval('.a-offscreen', el => el.innerText);
        name = await AOD.$eval('#aod-offer-soldBy > div > div >  div:nth-child(2) >a', el => el.innerText);
    }
    // await amazonPage.waitFor(1000)
    return { name, price }
}
findAODOfferList = async (amazonPage) => {
    let offers = []
    await amazonPage.waitForXPath('//*[@id="aod-offer"]');
    const pinnedAOD = await amazonPage.$$('[id="aod-offer"]');
    for (let AOD of pinnedAOD) {
        let price;
        let name;
        price = await AOD.$eval('.a-offscreen', el => el.innerText);
        name = await AOD.$eval('#aod-offer-soldBy > div > div >  div:nth-child(2) >a', el => el.innerText);
        offers.push({ name, price })
    }
    return offers
}
module.exports = {
    findPinnedAOD,
    findAODOfferList,
}