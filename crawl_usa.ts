import puppeteer from 'puppeteer';
import cheerio from 'cheerio';
import readline from 'readline';
import { randomInt } from 'crypto';
import fs from 'fs';

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
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	// Navigate to the first page
	console.log('https://www.officialusa.com/p/' + search);
	await page.goto(`https://www.officialusa.com/p/${search}`, {
		waitUntil: 'networkidle0',
	});

	const links = await page.$$eval(
		'body > div.container.flex-grow-1.mt-5.mb-5 > div.row.border-bottom.pb-3 > div > a',
		(elements) => elements.map((element) => element.getAttribute('href'))
	);
	console.log('Total links found: ', links.length);
	// Loop through each link and extract the name and phone number

	for (let i = 0; i < links.length; i++) {
		const link = links[i];
		// Navigate to the provider detail page
		await page.goto(`https://www.officialusa.com${link}`, {
			waitUntil: 'networkidle0',
		});

		// Parse the HTML content using Cheerio
		const $ = cheerio.load(await page.content(), { xml: true }, false);
		// Extract the required information
		// #Aadsen-5ah07q > div.detail-block__main-item-top > div.detail-block__main-item-name > h2 > span
		// extract the name in array

		///html/body/div/main/div/div/div/div[1]/div[2]/div[1] #Aab-a5kduv > div.detail-block__main-item-top > div.detail-block__main-item-name > h2 > span
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
	}
	await browser.close();
}      