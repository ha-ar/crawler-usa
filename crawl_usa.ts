import * as cheerio from 'cheerio';
import readline from 'readline';
import { randomInt } from 'crypto';
import fs from 'fs';
import axios from 'axios';

const fileName = `usa_${randomInt(10)}.csv`;

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

rl.question('Enter alphabet and page number e.g. a/2 : ', (_search) => {
	getResults(_search);
	rl.close();
});

async function getResults(search: string) {
	// const browser = await puppeteer.launch({ headless: 'shell' });
	// const page = await browser.newPage();
	// Navigate to the first page
	const html = await fetch('https://www.officialusa.com/p/' + search, {
		headers: {
			accept:
				'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
			'accept-language': 'en-US,en;q=0.9',
			priority: 'u=0, i',
			'sec-ch-ua':
				'"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
			'sec-ch-ua-mobile': '?1',
			'sec-ch-ua-platform': '"Android"',
			'sec-fetch-dest': 'document',
			'sec-fetch-mode': 'navigate',
			'sec-fetch-site': 'none',
			'sec-fetch-user': '?1',
			'upgrade-insecure-requests': '1',
			cookie: 'PHPSESSID=dg813dog802sbd3p7251i271qc',
		},
		referrerPolicy: 'strict-origin-when-cross-origin',
		body: null,
		method: 'GET',
	});
	console.log('https://www.officialusa.com/p/' + search);
	console.log(
		'****************************************************************************************************'
	);
	const data = await html.text();
	const $ = cheerio.load(data);
	// Extract the links

	const links = $(
		'div.container.flex-grow-1.mt-5.mb-5 > div.row.border-bottom.pb-3 > div'
	).map((index, element) => {
		const link = $(element).find('a').attr('href');
		console.log(link);
		return link;
	});

	// const links = await axios
	// 	.get('https://www.officialusa.com/p/' + search)
	// 	.then((response) => {
	// 		// const $ = cheerio.load(response.data);
	// 		console.log(response.data);
	// 	});

	for (let i = 0; i < links.length; i++) {
		// Navigate to the provider detail page
		const page = await fetch('https://www.officialusa.com' + links[i], {
			headers: {
				accept:
					'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
				'accept-language': 'en-US,en;q=0.9',
				priority: 'u=0, i',
				'sec-ch-ua':
					'"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
				'sec-ch-ua-mobile': '?1',
				'sec-ch-ua-platform': '"Android"',
				'sec-fetch-dest': 'document',
				'sec-fetch-mode': 'navigate',
				'sec-fetch-site': 'none',
				'sec-fetch-user': '?1',
				'upgrade-insecure-requests': '1',
				cookie: 'PHPSESSID=dg813dog802sbd3p7251i271qc',
			},
			referrerPolicy: 'strict-origin-when-cross-origin',
			body: null,
			method: 'GET',
		});

		// Parse the HTML content using Cheerio
		const $ = cheerio.load(await page.text());
		// Extract the required information
		// #Aadsen-5ah07q > div.detail-block__main-item-top > div.detail-block__main-item-name > h2 > span
		// extract the name in array

		// /html/body/div/main/div/div/div/div[1]/div[2]/div[1] #Aab-a5kduv > div.detail-block__main-item-top > div.detail-block__main-item-name > h2 > span
		const parents = $('div.person');
		parents.each(function (index, parent) {
			const name = $(parent)
				.find('div.detail-block__main-item-name > h2 > span')
				.text();
			const phone = $(parent)
				.find(
					'div.detail-block__main-item-content > div > div:nth-child(2) > div > ul > li:nth-child(1) > span'
				)
				.text();

			console.log(name, phone);
			// savse the extracted information to a file
			fs.appendFile(fileName, `${name}, ${phone} \n`, (err: any) => {
				if (err) throw err;
				console.log('The data has been saved!');
			});
		});
	}
	// const parents = $('div.person').map((index, parent) => {

	// console.log(parents);

	// const name = $(
	// 	'div.person  > div.detail-block__main-item-top > div.detail-block__main-item-name > h2 > span'
	// ).text();
	// //#Aadsen-1b6je6 > div.detail-block__main-item-content > div > div:nth-child(2) > div > ul > li:nth-child(1) > span
	// //#Aaberg-6ucdvn > div.detail-block__main-item-top > div.detail-block__main-item-name > h2 > span
	// // extract the phone number
	// const phone = $(
	// 	'div.person > div.detail-block__main-item-content > div > div:nth-child(2) > div > ul > li:nth-child(1) > span'
	// ).text();
	// // save extracted information to csv file
	// console.log({ name, phone });
	// save the extracted information to a file
	// const fs = require('fs');
	// fs.addHeader = true;
	// fs.appendFile('usa.csv', `${name}, ${phone} \n`, (err: any) => {
	// 	if (err) throw err;
	// 	console.log('The data has been saved!');
	// });
	// }
	// await browser.close();
}
