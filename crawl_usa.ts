import puppeteer from 'puppeteer';
import cheerio from 'cheerio';
import readline from 'readline';

let search : string, num : any;
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


rl.question('Enter alphabet and total number (add 0 for all) .. e.g., a 1000 : ', (_search) => {
    console.log(
			`searching for ${_search.split(' ')[0]} and extracting ${
				_search.split(' ')[1]
			} records...`
		);
    search  = _search.split(' ')[0];
    num = _search.split(' ')[1];
    getResults(search, num);
    rl.close()
});

async function getResults (search : string, num : any) {  
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	// Navigate to the first page
	await page.goto(`https://www.officialusa.com/p/${search}`, {
		waitUntil: 'networkidle2',
	});

    const  links = await page.$$eval(
        'body > div.container.flex-grow-1.mt-5.mb-5 > div.row.border-bottom.pb-3 > div > a',
        (elements) => elements.map((element) => element.getAttribute('href'))
    );
    console.log('Total links found: ', links.length);
	// Loop through each link and extract the name and phone number
    
    if (num  == 0) {
        num = links.length;
    }
    for (let i = 0; i < num; i++) {
			const link = links[i];

			// Navigate to the provider detail page
			await page.goto(`https://www.officialusa.com${link}`, {
				waitUntil: 'networkidle2',
			});

			// Parse the HTML content using Cheerio
			const $ = cheerio.load(await page.content());
			// Extract the required information
			// #Aadsen-5ah07q > div.detail-block__main-item-top > div.detail-block__main-item-name > h2 > span
			// extract the name in array
			////*[@id="Aab-5k3inc"]/div[1]/div[2]/h2/span
			///html/body/div/main/div/div/div/div[1]/div[2]/div[1]
			const name = $('div.detail-block__main-item-top > div.detail-block__main-item-name > h2 ').text();
			//#Aadsen-1b6je6 > div.detail-block__main-item-content > div > div:nth-child(2) > div > ul > li:nth-child(1) > span
			// extract the phone number
			const phone = $('div.detail-block__main-item-content > div > div:nth-child(2) > div > ul > li > span').text();
			// save extracted information to csv file
			console.log({ name, phone });
			// save the extracted information to a file
			const fs = require('fs');
			fs.addHeader = true;
			fs.appendFile('usa.csv', `${name}, ${phone},`, (err: any) => {
				if (err) throw err;
				console.log('The data has been saved!');
			});
		}
        await browser.close();
    }      