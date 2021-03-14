var log = require('loglevel');
log.setLevel('debug')
const profilePictureSelector = 'a.r-14lw9ot > div:nth-child(2)'
gotoFollowingPage = async (page) => {// goto profile page
    await page.goto(`https://twitter.com/following`)

    await page.waitForXPath('//*[@id="react-root"]/div/div/div[2]/header');
}
gotoFollowingPageOf = async (page, screenName) => {// goto profile page
    await page.goto(`https://twitter.com/${screenName}/following`)
    await page.waitForXPath('//*[@id="react-root"]/div/div/div[2]/header');
}

gotoFollowersPageOf = async (page, screenName) => {// goto profile page
    await page.goto(`https://twitter.com/${screenName}/followers`)
    // await page.waitForXPath('//*[@id="react-root"]/div/div/div[2]/header');
}

gotoFollowersPage = async (page) => {// goto profile page
    await page.goto(`https://twitter.com/followers`)
    await page.waitForXPath('//*[@id="react-root"]/div/div/div[2]/header');
}

getAllProfilesInView = async (page) => {
    return await page.$$('#react-root > div > div > div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > main > div > div > div > div > div > div:nth-child(2) > section > div > div > div');
}

unfollowInView = async (page, children) => {
    for (let i = 0; i < children.length; i++) {
        try {
            let follows = await children[i].$eval('div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > a:nth-child(1) > div > div:nth-child(2) > div:nth-child(2) > span ', el => el.innerHTML);
            log.debug(follows);
        } catch {
            unfollowButton = await children[i].$(' div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > span:nth-child(1) > span:nth-child(1)')
            await unfollowButton.click()
            await page.waitFor(1000)
            await page.waitForXPath('//*[@id="layers"]/div[2]/div/div/div/div/div/div[2]/div[2]/div[3]/div[2]/div/span/span');
            unfollowConfirmButton = await page.$x('//*[@id="layers"]/div[2]/div/div/div/div/div/div[2]/div[2]/div[3]/div[2]/div/span/span')
            unfollowConfirmButton[0].click()
        }
    }
}

isDMOpen = async (profilePage) => {

}

openProfilePage = async (browser, url) => {
    let profilePage = await browser.newPage();
    await profilePage.goto(url);
    return profilePage
}

closeProfilePage = async (profilePage) => {
    await profilePage.close();
    return false
}

formatCount = (val) => {
    multiplier = val.substr(-1).toLowerCase();
    if (multiplier == "k")
        return parseFloat(val) * 1000;
    else if (multiplier == "m")
        return parseFloat(val) * 1000000;
    else
        return parseInt(val)
}

bypassProfilePageRestricted = async (profilePage) => {
    try {
        let profilePictureSelector = 'a.r-14lw9ot > div:nth-child(2)'
        await profilePage.waitForSelector(profilePictureSelector);
        viewProfileButtonSelector = 'div.r-1niwhzg:nth-child(3) > div:nth-child(1) > span:nth-child(1) > span:nth-child(1)'
        let button = await profilePage.$(viewProfileButtonSelector)
        await button.click()
        log.warn('profile restricted')
        return true
    } catch {
        return false
    }
}

getProfileDetails = async (profilePage) => {
    try {
        await bypassProfilePageRestricted(profilePage)
        let profilePageFollowsBack = await isProfilePageFollowingBack(profilePage)
        let handle = await getProfilePageHandle(profilePage)
        let location = await getProfilePageLocation(profilePage)
        let bio = await getProfilePageBio(profilePage)
        if (!profilePageFollowsBack) {
            let followingValueSelector = '#react-root > div > div > div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > main > div > div > div > div > div > div:nth-child(2) > div > div > div:nth-child(1) > div > div:nth-child(5) > div.css-1dbjc4n.r-1mf7evn > a > span.css-901oao.css-16my406.r-1qd0xha.r-vw2c0b.r-ad9z0x.r-bcqeeo.r-qvutc0 > span'
            // await profilePage.waitForSelector(followingValueSelector);
            let followingElement = await profilePage.$(followingValueSelector)
            let followingText = await followingElement.getProperty('textContent')
            let followingValue = formatCount(followingText._remoteObject.value)
            let followersValueSelector = '#react-root > div > div > div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > main > div > div > div > div > div > div:nth-child(2) > div > div > div:nth-child(1) > div > div:nth-child(5) > div:nth-child(2) > a > span.css-901oao.css-16my406.r-1qd0xha.r-vw2c0b.r-ad9z0x.r-bcqeeo.r-qvutc0 > span'
            // await profilePage.waitForSelector(followersValueSelector);
            let followersElement = await profilePage.$(followersValueSelector)
            let followersText = await followersElement.getProperty('textContent')
            let followersValue = formatCount(followersText._remoteObject.value)
            return { followingValue, followersValue, followsBack: 0, handle, location, bio }
        } else if (!location && !bio) {
            let followingValueSelector = 'div.r-1w6e6rj:nth-child(4) > div:nth-child(1) > a:nth-child(1) > span:nth-child(1) > span:nth-child(1)'
            // await profilePage.waitForSelector(followingValueSelector);
            let followingElement = await profilePage.$(followingValueSelector)
            let followingText = await followingElement.getProperty('textContent')
            let followingValue = formatCount(followingText._remoteObject.value)
            let followersValueSelector = 'div.r-1w6e6rj:nth-child(4) > div:nth-child(2) > a:nth-child(1) > span:nth-child(1) > span:nth-child(1)'
            // await profilePage.waitForSelector(followersValueSelector);
            let followersElement = await profilePage.$(followersValueSelector)
            let followersText = await followersElement.getProperty('textContent')
            let followersValue = formatCount(followersText._remoteObject.value)
            return { followingValue, followersValue, followsBack: 1, handle, location, bio }
        } else {
            let followingValueSelector = 'div.r-18u37iz:nth-child(5) > div:nth-child(1) > a:nth-child(1) > span:nth-child(1) > span:nth-child(1)'
            // await profilePage.waitForSelector(followingValueSelector);
            let followingElement = await profilePage.$(followingValueSelector)
            let followingText = await followingElement.getProperty('textContent')
            let followingValue = formatCount(followingText._remoteObject.value)
            let followersValueSelector = 'div.r-18u37iz:nth-child(5) > div:nth-child(2) > a:nth-child(1) > span:nth-child(1) > span:nth-child(1)'
            // await profilePage.waitForSelector(followersValueSelector);
            let followersElement = await profilePage.$(followersValueSelector)
            let followersText = await followersElement.getProperty('textContent')
            let followersValue = formatCount(followersText._remoteObject.value)
            return { followingValue, followersValue, followsBack: 1, handle, location, bio }
        }
    } catch (e) {
        log.debug(e)
        return { followingValue: 0, followersValue: 0, followsBack: 0, handle: null, location: null, bio: null }
    }
}

followUser = async (browser, screenName) => {
    // Create browser instance, and give it a first tab
    let page = await browser.newPage();
    // Allows you to intercept a request; must appear before
    // your first page.goto()
    await page.setRequestInterception(true);

    // Request intercept handler... will be triggered with 
    // each page.goto() statement
    page.on('request', interceptedRequest => {

        // Here, is where you change the request method and 
        // add your post data
        var data = {
            'method': 'POST',
            'headers': {
                ...interceptedRequest.headers()
            },
            'postData': 'include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&skip_status=1&id=113130846'
        };

        // Request modified... finish sending! 
        interceptedRequest.continue(data);
        // page.setRequestInterception(false);
    });

    // Navigate, trigger the intercept, and resolve the response
    const response = await page.goto('https://twitter.com/i/api/1.1/friendships/create.json');
    const responseBody = await response.text();
    log.debug(responseBody);

    // Close the browser - done! 
    await browser.close();
}

followProfile = async (profilePage) => {
    try {
        await profilePage.waitFor(1000)
        let followButtonSelector = '#react-root > div > div > div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > main > div > div > div > div > div > div:nth-child(2) > div > div > div:nth-child(1) > div.css-1dbjc4n.r-ku1wi2.r-1j3t67a.r-m611by > div.css-1dbjc4n.r-obd0qt.r-18u37iz.r-1w6e6rj.r-1wtj0ep > div > div:nth-child(2)';
        // let profilePictureSelector = '#react-root > div > div > div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > main > div > div > div > div > div > div:nth-child(2) > div > div > div:nth-child(1) > div.css-1dbjc4n.r-ku1wi2.r-1j3t67a.r-m611by > div.css-1dbjc4n.r-obd0qt.r-18u37iz.r-1w6e6rj.r-1wtj0ep > a > div.css-1dbjc4n.r-1twgtwe.r-sdzlij.r-rs99b7.r-1p0dtai.r-1mi75qu.r-1d2f490.r-1ny4l3l.r-u8s1d.r-zchlnj.r-ipm5af.r-o7ynqc.r-6416eg'
        await profilePage.waitForSelector(profilePictureSelector);
        let attr = await profilePage.$eval(followButtonSelector, el => el.getAttribute('data-testid'));
        if (attr != 'placementTracking') {

            attr = await profilePage.$eval('#react-root > div > div > div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > main > div > div > div > div > div > div:nth-child(2) > div > div > div:nth-child(1) > div.css-1dbjc4n.r-ku1wi2.r-1j3t67a.r-m611by > div.css-1dbjc4n.r-obd0qt.r-18u37iz.r-1w6e6rj.r-1wtj0ep > div > div:nth-child(3)', el => el.getAttribute('data-testid'));
            if (attr != 'placementTracking') {
                followButtonSelector = '#react-root > div > div > div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > main > div > div > div > div > div > div:nth-child(2) > div > div > div:nth-child(1) > div.css-1dbjc4n.r-ku1wi2.r-1j3t67a.r-m611by > div.css-1dbjc4n.r-obd0qt.r-18u37iz.r-1w6e6rj.r-1wtj0ep > div > div:nth-child(4)'
                attr = await profilePage.$eval(followButtonSelector, el => el.getAttribute('data-testid'));
            }
            else
                followButtonSelector = 'div.r-1w6e6rj:nth-child(2) > div:nth-child(3)'
        }
        let x = await profilePage.$(followButtonSelector);
        await x.click();
        await profilePage.waitFor(1000)
        // await profilePage.waitForXPath('//*[@id="layers"]/div[2]/div/div/div/div/div/div[2]/div[2]/div[3]/div[2]/div/span/span');
        // unfollowConfirmButton = await profilePage.$x('//*[@id="layers"]/div[2]/div/div/div/div/div/div[2]/div[2]/div[3]/div[2]/div/span/span')
        // await unfollowConfirmButton[0].click()
    } catch (e) {
        log.debug(e)
        return false;
    }
}

findClickLikesSpanOnTweetPage = async (tweetPage) => {
    tweetPage.waitFor(1000)
    // finds likes button, clicks it and then confirms the unfollow via twitter confirm unfollow dialog
    await tweetPage.waitForXPath("//span[contains(., 'Likes')]");
    const likesSpans = await tweetPage.$x("//span[contains(., 'Likes')]");
    for (likeSpan of likesSpans) {
        let spanElement = await likeSpan.getProperty('innerText');
        spanElement = await spanElement.jsonValue();
        if (spanElement == 'Likes') {
            await likeSpan.click()
            break;
        }
    }
    await tweetPage.waitFor(1000)
}

// findProductCompetitor = async (tweetPage) => {
//     tweetPage.waitFor(1000)
//     // finds likes button, clicks it and then confirms the unfollow via twitter confirm unfollow dialog
//     await tweetPage.waitForXPath("//span[contains(., 'Ships From')]");
//     const likesSpans = await tweetPage.$x("//span[contains(., 'Ships From')]");
//     for (likeSpan of likesSpans) {
//         let spanElement = await likeSpan.getProperty('innerText');
//         spanElement = await spanElement.jsonValue();
//         console.log(spanElement)
//     }
//     await tweetPage.waitFor(1000)
// }

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

findClickUnfollowButtonOnProfilePage = async (profilePage) => {
    profilePage.waitFor(1000)
    // finds unfollow button, clicks it and then confirms the unfollow via twitter confirm unfollow dialog
    await profilePage.waitForXPath("//span[contains(., 'Following')]");
    const followingSpans = await profilePage.$x("//span[contains(., 'Following')]");
    for (followingSpan of followingSpans) {
        let spanElement = await followingSpan.getProperty('innerText');
        spanElement = await spanElement.jsonValue();
        if (spanElement == 'Following') {
            await followingSpan.click()
            break;
        }
    }
    await profilePage.waitFor(1000)

    const unfollowButtons = await profilePage.$x("//span[contains(., 'Unfollow')]");
    for (unfollowButton of unfollowButtons) {
        let spanElement = await unfollowButton.getProperty('innerText');
        spanElement = await spanElement.jsonValue();
        if (spanElement == 'Unfollow') {
            await unfollowButton.click()
            break;
        }
    }
}

findClickFollowButtonOnProfilePage = async (profilePage) => {
    // finds unfollow button, clicks it and then confirms the unfollow via twitter confirm unfollow dialog
    const followSpans = await profilePage.$x("//span[contains(., 'Follow')]");
    for (followSpan of followSpans) {
        let spanElement = await followSpan.getProperty('innerText');
        spanElement = await spanElement.jsonValue();
        if (spanElement == 'Follow') {
            await followSpan.click()
            break;
        }
    }
    await profilePage.waitFor(1000)
}


unfollowProfile = async (profilePage) => {
    try {
        await profilePage.waitFor(1000)
        let unfollowButtonSelector = '#react-root > div > div > div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > main > div > div > div > div > div > div:nth-child(2) > div > div > div:nth-child(1) > div > div.css-1dbjc4n.r-obd0qt.r-18u37iz.r-1w6e6rj.r-1wtj0ep > div > div:nth-child(2)';
        let profilePictureSelector = '#react-root > div > div > div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > main > div > div > div > div > div > div:nth-child(2) > div > div > nav > div.css-1dbjc4n.r-18u37iz.r-16y2uox.r-1wbh5a2.r-tzz3ar.r-1pi2tsx.r-hbs49y > div:nth-child(1) > a > div > span'
        await profilePage.waitForSelector(profilePictureSelector);
        let attr = await profilePage.$eval(unfollowButtonSelector, el => el.getAttribute('data-testid'));
        if (attr != 'placementTracking') {

            attr = await profilePage.$eval('#react-root > div > div > div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > main > div > div > div > div > div > div:nth-child(2) > div > div > div:nth-child(1) > div > div.css-1dbjc4n.r-obd0qt.r-18u37iz.r-1w6e6rj.r-1wtj0ep > div > div:nth-child(3)', el => el.getAttribute('data-testid'));
            if (attr != 'placementTracking') {
                unfollowButtonSelector = '#react-root > div > div > div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > main > div > div > div > div > div > div:nth-child(2) > div > div > div:nth-child(1) > div > div.css-1dbjc4n.r-obd0qt.r-18u37iz.r-1w6e6rj.r-1wtj0ep > div > div:nth-child(4)'
                attr = await profilePage.$eval(unfollowButtonSelector, el => el.getAttribute('data-testid'));
            }
            else
                unfollowButtonSelector = 'div.r-1w6e6rj:nth-child(2) > div:nth-child(3)'
        }
        let x = await profilePage.$(unfollowButtonSelector);
        await x.click();
        await profilePage.waitFor(1000)
        await profilePage.waitForXPath('//*[@id="layers"]/div[2]/div/div/div/div/div/div[2]/div[2]/div[3]/div[2]/div/span/span');
        unfollowConfirmButton = await profilePage.$x('//*[@id="layers"]/div[2]/div/div/div/div/div/div[2]/div[2]/div[3]/div[2]/div/span/span')
        await unfollowConfirmButton[0].click()
    } catch {
        return false;
    }
}

getFollowingListChildProfileUrl = async (child) => {
    try {
        let url = await child.$eval('div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > a:nth-child(1) ', el => el.href);
        return url;
    } catch {
        return false;
    }
}


isFollowingBack = async (child) => {
    try {
        let follows = await child.$eval('div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > a:nth-child(1) > div > div:nth-child(2) > div:nth-child(2) > span ', el => el.innerHTML);
        if (follows) {
            return true;
        }
    } catch {
        return false;
    }
}

isProfilePageFollowingBack = async (profilePage) => {
    try {
        let profilePictureSelector = 'a.r-14lw9ot > div:nth-child(2)'
        await profilePage.waitForSelector(profilePictureSelector);
        let follows = await profilePage.$eval('div.r-e84r5y:nth-child(2) > span:nth-child(1)', el => el.innerHTML);
        // log.info(follows)
        if (follows) {
            return true;
        }
    } catch (e) {
        // log.info(e)
        return false;
    }
}

getProfilePageLocation = async (profilePage) => {
    try {
        let profilePictureSelector = 'a.r-14lw9ot > div:nth-child(2)'
        await profilePage.waitForSelector(profilePictureSelector);
        let location = await profilePage.$eval('#react-root > div > div > div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > main > div > div > div > div > div > div:nth-child(2) > div > div > div:nth-child(1) > div > div:nth-child(4) > div > span:nth-child(1) > span > span', el => el.innerHTML);
        return location;
    } catch (e) {
        return false;
    }
}

getProfilePageHandle = async (profilePage) => {
    try {
        let profilePictureSelector = 'a.r-14lw9ot > div:nth-child(2)'
        await profilePage.waitForSelector(profilePictureSelector);
        let handle = await profilePage.$eval('div.r-1g94qm0:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > span:nth-child(1)', el => el.innerHTML);
        // if (follows) {
        return handle;
        // }
    } catch (e) {
        // log.info(e)
        return false;
    }
}

createEmitter = () => {
    var events = require('events');
    return new events.EventEmitter();
}

getFollowingScreenNames = async (page, n = 100) => {
    var usersList = await getFollowingUsers(page, n)
    let screenNames = []
    for (let user of usersList) {
        screenNames.push(getExtractedUserScreenName(user))
    }
    return screenNames;
}

isLoggedIn = async (page) => {
    await page.goto('https://twitter.com/home')
    var x = await page.waitFor(3000)
    try {
        let errorPage = await page.$('#layers > div.css-1dbjc4n.r-aqfbo4.r-1d2f490.r-12vffkv.r-1xcajam.r-zchlnj.r-ipm5af > div > div > div > div > div > div.css-1dbjc4n.r-1awozwy.r-1kihuf0.r-18u37iz.r-1pi2tsx.r-1777fci.r-1pjcn9w.r-fxte16.r-1xcajam.r-ipm5af.r-g6jmlv > div.css-1dbjc4n.r-14lw9ot.r-1ylenci.r-1jgb5lz.r-pm9dpa.r-1ye8kvj.r-1rnoaur.r-13qz1uu > div > div.css-1dbjc4n.r-1awozwy.r-16y2uox.r-1oy2gb8 > div > div.css-1dbjc4n.r-ku1wi2.r-13qz1uu > div.css-18t94o4.css-1dbjc4n.r-1niwhzg.r-p1n3y5.r-sdzlij.r-1phboty.r-rs99b7.r-1w2pmg.r-19h5ruw.r-1jayybb.r-17bavie.r-1ny4l3l.r-15bsvpr.r-o7ynqc.r-6416eg.r-lrvibr > div')
        errorPage.click()
    } catch (e) {
        log.debug("no errorpage")
    }
    var url = await page.evaluate(() => window.document.URL);
    if (url == "https://twitter.com/login" || url == "https://twitter.com/logout/error") {
        return false;
    } else {
        return true;
    }
}

login = async (page, user, pass) => {
    await page.goto('https://twitter.com/login')

    await page.waitForXPath('//*[@id="react-root"]/div/div/div[2]/main/div/div/div[2]/form/div/div[1]/label/div/div[2]/div/input');
    const usernameInputField = await page.$x('//*[@id="react-root"]/div/div/div[2]/main/div/div/div[2]/form/div/div[1]/label/div/div[2]/div/input');
    await usernameInputField[0].type(user)
    const passwordInputField = await page.$x('//*[@id="react-root"]/div/div/div[2]/main/div/div/div[2]/form/div/div[2]/label/div/div[2]/div/input');
    await passwordInputField[0].type(pass)
    const submitButton = await page.$x('//*[@id="react-root"]/div/div/div[2]/main/div/div/div[2]/form/div/div[3]/div/div');
    await submitButton[0].click()
    await page.waitForNavigation()
    let loggedIn = isLoggedIn(page)
    return loggedIn ? true : false
}

logout = async (page) => {
    await page.goto('https://twitter.com')
    await page.waitForSelector('.r-j66t93 > div:nth-child(2)')
    let pp = await page.$('.r-j66t93 > div:nth-child(2)')
    await pp.click()
    await page.waitForSelector('#layers > div.css-1dbjc4n.r-1d2f490.r-105ug2t.r-u8s1d.r-zchlnj.r-ipm5af > div > div > div.css-1dbjc4n.r-aqfbo4.r-1xcajam > div > div:nth-child(2) > div > div > div > div > div > a:nth-child(4) > div > div > span > span')
    let logoutButton = await page.$('#layers > div.css-1dbjc4n.r-1d2f490.r-105ug2t.r-u8s1d.r-zchlnj.r-ipm5af > div > div > div.css-1dbjc4n.r-aqfbo4.r-1xcajam > div > div:nth-child(2) > div > div > div > div > div > a:nth-child(4) > div > div > span > span')
    await logoutButton.click();
    await page.waitForSelector('#layers > div:nth-child(2) > div > div > div > div > div > div.css-1dbjc4n.r-1awozwy.r-1kihuf0.r-18u37iz.r-1pi2tsx.r-1777fci.r-1pjcn9w.r-fxte16.r-1xcajam.r-ipm5af.r-9dcw1g > div.css-1dbjc4n.r-1awozwy.r-14lw9ot.r-1ylenci.r-1jgb5lz.r-pm9dpa.r-1ye8kvj.r-1rnoaur.r-d9fdf6.r-1sxzll1.r-13qz1uu > div.css-1dbjc4n.r-18u37iz.r-13qz1uu > div.css-18t94o4.css-1dbjc4n.r-urgr8i.r-42olwf.r-sdzlij.r-1phboty.r-rs99b7.r-16y2uox.r-1w2pmg.r-1vuscfd.r-1dhvaqw.r-1ny4l3l.r-1fneopy.r-o7ynqc.r-6416eg.r-lrvibr')
    let logoutPopup = await page.$('#layers > div:nth-child(2) > div > div > div > div > div > div.css-1dbjc4n.r-1awozwy.r-1kihuf0.r-18u37iz.r-1pi2tsx.r-1777fci.r-1pjcn9w.r-fxte16.r-1xcajam.r-ipm5af.r-9dcw1g > div.css-1dbjc4n.r-1awozwy.r-14lw9ot.r-1ylenci.r-1jgb5lz.r-pm9dpa.r-1ye8kvj.r-1rnoaur.r-d9fdf6.r-1sxzll1.r-13qz1uu > div.css-1dbjc4n.r-18u37iz.r-13qz1uu > div.css-18t94o4.css-1dbjc4n.r-urgr8i.r-42olwf.r-sdzlij.r-1phboty.r-rs99b7.r-16y2uox.r-1w2pmg.r-1vuscfd.r-1dhvaqw.r-1ny4l3l.r-1fneopy.r-o7ynqc.r-6416eg.r-lrvibr')
    await logoutPopup.click()
}

getFollowers = async (page, n = 100) => {
    var extractedUsers = []
    var twitterEvents = createEmitter();

    listenForFollowersData(page, twitterEvents);
    twitterEvents.on('newFollowersData', (data) => {
        for (let user of data) {
            if (user.content.entryType == 'TimelineTimelineCursor') {
                continue;
            }
            if (user.content.entryType == 'TimelineTimelineItem') {
                extractedUsers.push(user.content.itemContent.user)
            }
        }
    })
    await gotoFollowersPage(page)
    // await page.waitFor(1000)
    let absoluteScrollBottomReached;
    while (extractedUsers.length < n) {
        log.debug(`extracted ${extractedUsers.length}`)
        absoluteScrollBottomReached = await scrollToBottom(page);
        if (absoluteScrollBottomReached)
            break;
        await page.waitFor(1000)
    }
    if (extractedUsers.length >= n || absoluteScrollBottomReached) {
        twitterEvents.removeAllListeners(['newFollowersData'])
        page.off("response", (r) => { log.debug(r) })
        return extractedUsers
    }
}

getFollowersOf = async (page, screenName, n = 100) => {
    log.info('getting following users list for ' + screenName)
    var extractedUsers = []
    var twitterEvents = createEmitter();

    listenForFollowersData(page, twitterEvents);
    twitterEvents.on('newFollowersData', (data) => {
        for (let user of data) {
            if (user.content.entryType == 'TimelineTimelineCursor') {
                continue;
            }
            if (user.content.entryType == 'TimelineTimelineItem') {
                extractedUsers.push(user.content.itemContent.user)
            }
        }
    })
    await gotoFollowersPageOf(page, screenName)
    // await page.waitFor(1000)
    let absoluteScrollBottomReached;
    while (extractedUsers.length < n) {
        log.debug(`extracted ${extractedUsers.length}`)
        absoluteScrollBottomReached = await scrollToBottom(page);
        if (absoluteScrollBottomReached)
            break;
        await page.waitFor(1000)
    }
    if (extractedUsers.length >= n || absoluteScrollBottomReached) {
        twitterEvents.removeAllListeners(['newFollowersData'])
        page.off("response", (r) => { log.debug(r) })
        return extractedUsers

    }
}


getFollowingUsers = async (page, n = 100) => {
    // log.info('getting following users list')
    var extractedUsers = []
    var twitterEvents = createEmitter();

    listenForFollowingData(page, twitterEvents);
    twitterEvents.on('newFollowingData', (data) => {
        for (let user of data) {
            if (user.content.entryType == 'TimelineTimelineCursor') {
                continue;
            }
            if (user.content.entryType == 'TimelineTimelineItem') {
                extractedUsers.push(user.content.itemContent.user)
            }
        }
    })
    await gotoFollowingPage(page)
    await page.waitFor(1000)
    let absoluteScrollBottomReached;
    while (extractedUsers.length < n) {
        log.debug(`extracted ${extractedUsers.length}`)
        absoluteScrollBottomReached = await scrollToBottom(page);
        if (absoluteScrollBottomReached)
            break;
        await page.waitFor(1000)
    }
    if (extractedUsers.length >= n || absoluteScrollBottomReached) {
        twitterEvents.removeAllListeners(['newFollowingData'])
        page.off("response", (r) => { log.debug(r) })
        return extractedUsers

    }
}

getFollowingUsersOf = async (page, screenName, n = 100, start = 0) => {
    log.info('getting following users list for ' + screenName)
    var extractedUsers = []
    var skippedUsers = 0
    var twitterEvents = createEmitter();

    listenForFollowingData(page, twitterEvents);
    twitterEvents.on('newFollowingData', (data) => {
        // log.info(data)
        for (let user of data) {
            if (user.content.entryType == 'TimelineTimelineCursor') {
                continue;
            }
            if (user.content.entryType == 'TimelineTimelineItem') {
                if (skippedUsers >= start) {
                    extractedUsers.push(user.content.itemContent.user)
                } else {
                    skippedUsers = skippedUsers + 1
                }
            }
        }
    })
    await gotoFollowingPageOf(page, screenName)
    await page.waitFor(1000)
    let absoluteScrollBottomReached;
    while (extractedUsers.length < n) {
        log.debug(`extracted ${extractedUsers.length}`)
        absoluteScrollBottomReached = await scrollToBottom(page);
        if (absoluteScrollBottomReached)
            break;
        await page.waitFor(1000)
    }
    if (extractedUsers.length >= n || absoluteScrollBottomReached) {
        twitterEvents.removeAllListeners(['newFollowingData'])
        page.off("response", (r) => { log.debug(r) })
        return extractedUsers

    }
}

getTweetResponders = async (page, tweetUrl, n = 100) => {
    // log.info('getting following users list')
    var extractedUsers = []
    var twitterEvents = createEmitter();

    listenForResponders(page, twitterEvents);
    twitterEvents.on('newRespondedUsers', (data) => {
        for (let user of Object.entries(data)) {
            extractedUsers.push({ [user[0]]: user[1] })
        }
    })
    await page.goto(tweetUrl)
    await page.waitFor(1000)
    let absoluteScrollBottomReached;
    while (extractedUsers.length < n) {
        log.debug(`extracted ${extractedUsers.length}`)
        absoluteScrollBottomReached = await scrollToBottom(page);
        if (absoluteScrollBottomReached)
            break;
        await page.waitFor(1000)
    }
    if (extractedUsers.length >= n || absoluteScrollBottomReached) {
        twitterEvents.removeAllListeners(['newRespondedUsers'])
        page.off("response", (r) => { log.debug(r) })
        return extractedUsers
    }
}

getTweetLikedByUsers = async (page, tweetUrl, n = 100) => {
    // log.info('getting following users list')
    var extractedUsers = []
    var twitterEvents = createEmitter();

    listenForLikedByUsers(page, twitterEvents);
    twitterEvents.on('newLikedByUsers', (data) => {
        for (let user of Object.entries(data)) {
            extractedUsers.push({ [user[0]]: user[1] })
        }
    })
    await page.goto(tweetUrl)
    await page.waitFor(1000)
    await findClickLikesSpanOnTweetPage(page)
    let popup = await page.$('.r-1dqxon3 > div:nth-child(1) > section:nth-child(1) > div:nth-child(2)')
    await popup.hover()
    let absoluteScrollBottomReached;
    while (extractedUsers.length < n) {
        log.debug(`extracted ${extractedUsers.length}`)
        absoluteScrollBottomReached = await scrollToBottom(popup);
        if (absoluteScrollBottomReached)
            break;
        await page.waitFor(1000)
    }
    if (extractedUsers.length >= n || absoluteScrollBottomReached) {
        twitterEvents.removeAllListeners(['newLikedByUsers'])
        page.off("response", (r) => { log.debug(r) })
        return extractedUsers
    }
}

getExtractedUserScreenName = (extractedUser) => {
    return typeof (extractedUser.legacy) != 'undefined' ? extractedUser.legacy.screen_name
        : typeof extractedUser.screen_name != 'undefined' ?
            extractedUser.screen_name : false
}

getExtractedUserBlockedBy = (extractedUser) => {
    return typeof extractedUser.legacy != 'undefined'
        ? extractedUser.legacy.blocked_by
        : typeof extractedUser.blocked_by != 'undefined' ?
            extractedUser.blocked_by : false
}

getExtractedUserBlocking = (extractedUser) => {
    return typeof extractedUser.legacy != 'undefined'
        ? extractedUser.legacy.blocking
        : typeof extractedUser.blocking != 'undefined' ?
            extractedUser.blocking : false
}
getExtractedUserCanDM = (extractedUser) => {
    return typeof extractedUser.legacy != 'undefined'
        ? extractedUser.legacy.can_dm
        : typeof extractedUser.can_dm != 'undefined' ?
            extractedUser.can_dm : false
}
getExtractedUserDescription = (extractedUser) => {
    return typeof extractedUser.legacy != 'undefined'
        ? extractedUser.legacy.description
        : typeof extractedUser.description != 'undefined' ?
            extractedUser.description : false
}

getExtractedUserAmIFollowing = (extractedUser) => {
    return typeof extractedUser.legacy != 'undefined'
        ? extractedUser.legacy.following
        : typeof extractedUser.following != 'undefined' ?
            extractedUser.following : false
}

getExtractedUserIsProtected = (extractedUser) => {
    return typeof extractedUser.legacy != 'undefined'
        ? extractedUser.legacy.protected
        : typeof extractedUser.protected != 'undefined' ?
            extractedUser.protected : false
}

getExtractedUserFollowerCount = (extractedUser) => {
    return typeof extractedUser.legacy != 'undefined'
        ? extractedUser.legacy.normal_followers_count
        : typeof extractedUser.normal_followers_count != 'undefined' ?
            extractedUser.normal_followers_count : false
}

getExtractedUserFollowingCount = (extractedUser) => {
    return typeof extractedUser.legacy != 'undefined'
        ? extractedUser.legacy.friends_count
        : typeof extractedUser.friends_count != 'undefined' ?
            extractedUser.friends_count : false
}

getExtractedUserFollowedBy = (extractedUser) => {
    return typeof extractedUser.legacy != 'undefined'
        ? extractedUser.legacy.followed_by
        : typeof extractedUser.followed_by != 'undefined' ?
            extractedUser.followed_by : false
}

listenIfActiveInLastOneMonth = async (browser, screenName) => {
    const ONE_HOUR = 60 * 60 * 1000;
    const ONE_DAY = ONE_HOUR * 24;
    const ONE_MONTH = ONE_DAY * 30;
    const ONE_MONTH_AGO = Date.now() - ONE_MONTH;
    let finish = 0
    let active = null
    let profilePage = await browser.newPage();
    await profilePage.on('response', async response => {
        const url = response.url();
        if (url.includes('timeline/profile')) {
            try {
                var data = await response.json()
                if (data) {
                    for (let instruction of data.timeline.instructions) {
                        if (instruction.addEntries.entries[0].entryId.includes('promotedTweet')) {
                            active = !(new Date(data.globalObjects.tweets[instruction.addEntries.entries[1].sortIndex].created_at) < ONE_MONTH_AGO)
                        } else {
                            log.debug(new Date(data.globalObjects.tweets[instruction.addEntries.entries[0].sortIndex].created_at))
                            active = !(new Date(data.globalObjects.tweets[instruction.addEntries.entries[0].sortIndex].created_at) < ONE_MONTH_AGO)
                        }
                        finish = 1
                        log.debug({ finish })

                        return {
                            active,
                            profilePage
                        }
                    }
                }
            } catch (e) {
                log.debug(e)
                return { active, profilePage }
            }
        }
    });

    await profilePage.goto(`https://twitter.com/${screenName}`);
    await profilePage.waitFor(1000)
    for (let i = 0; i < 3; i++) {
        if (finish) {
            profilePage.off('response', (r) => { log.debug(r) })
            break;
        }

        log.info('waiting to check if user is active')
        await profilePage.waitFor(1000)

    }
    return { active, profilePage }

}

listenForFollowingData = async (page, eventEmitter) => {
    page.on('response', async response => {
        const url = response.url();
        if (url.includes('/api/graphql/')) {
            try {
                var data = await response.json()
                if (data) {
                    for (let instruction of data.data.user.following_timeline.timeline.instructions) {
                        if (instruction.type == 'TimelineAddEntries') {
                            eventEmitter.emit('newFollowingData', (instruction.entries))
                        }
                    }
                }
            } catch (e) {
                log.debug(e)
            }
        }
    });
}

listenForLikedByUsers = async (page, eventEmitter) => {
    page.on('response', async response => {
        const url = response.url();
        if (url.includes('/timeline/liked_by')) {
            try {
                var data = await response.json()
                if (data) {
                    let users = data.globalObjects.users
                    eventEmitter.emit('newLikedByUsers', (users))
                }
            } catch (e) {
                log.debug(e)
            }
        }
    });
}

listenForResponders = async (page, eventEmitter) => {
    page.on('response', async response => {
        const url = response.url();
        if (url.includes('/timeline/conversation/')) {
            try {
                var data = await response.json()
                if (data) {
                    let users = data.globalObjects.users
                    eventEmitter.emit('newRespondedUsers', (users))
                }
            } catch (e) {
                log.debug(e)
            }
        }
    });
}

listenForFollowersData = async (page, eventEmitter) => {
    page.on('response', async response => {
        const url = response.url();
        if (url.includes('/graphql')) {
            try {
                var data = await response.json()
                if (data) {
                    for (let instruction of data.data.user.followers_timeline.timeline.instructions) {
                        if (instruction.type == 'TimelineAddEntries') {
                            eventEmitter.emit('newFollowersData', (instruction.entries))
                        }
                    }
                }

            } catch (e) {
                // log.info(e)
            }
        }
    });
}

getProfilePageBio = async (profilePage) => {
    try {
        let profilePictureSelector = 'a.r-14lw9ot > div:nth-child(2)'
        await profilePage.waitForSelector(profilePictureSelector);
        let bio = await profilePage.$eval('#react-root > div > div > div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > main > div > div > div > div > div > div:nth-child(2) > div > div > div:nth-child(1) > div > div:nth-child(3) > div > div ', el => el.innerHTML);
        return bio;
    } catch (e) {
        return false;
    }
}

scrollToBottom = async (page) => {
    // if (!previousHeight)
    let previousHeight = await page.evaluate('document.body.scrollHeight')
    await page.evaluate(_ => {
        window.scrollBy(0, document.body.scrollHeight);
    });
    try {
        await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`)
        return false
    } catch (e) {
        log.debug('absolute botton of scroll reached')
        return true
    }
}

module.exports = {
    isLoggedIn,
    login,
    logout,
    gotoFollowingPage,
    gotoFollowingPageOf,
    gotoFollowersPage,
    gotoFollowersPageOf,
    createEmitter,
    getAllProfilesInView,
    unfollowInView,
    getFollowingUsers,
    getFollowingUsersOf,
    getFollowers,
    getFollowersOf,
    getFollowingScreenNames,
    getTweetResponders,
    getTweetLikedByUsers,
    getExtractedUserScreenName,
    getExtractedUserFollowerCount, getExtractedUserFollowingCount,
    getExtractedUserFollowedBy, getExtractedUserBlockedBy, getExtractedUserBlocking,
    getExtractedUserCanDM, getExtractedUserDescription, getExtractedUserAmIFollowing,
    getExtractedUserIsProtected,
    getFollowingListChildProfileUrl,
    listenIfActiveInLastOneMonth,
    openProfilePage,
    closeProfilePage,
    getProfileDetails,
    followProfile,
    findClickFollowButtonOnProfilePage,
    followUser,
    unfollowProfile,
    findClickUnfollowButtonOnProfilePage,
    isProfilePageFollowingBack,
    isFollowingBack,
    scrollToBottom,
    listenForFollowingData,
    listenForLikedByUsers,
    // findProductCompetitor,
    findPinnedAOD,
    findAODOfferList,
    // getPinnedPrice,
    // findAODOfferList2
}