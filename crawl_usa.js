import * as cheerio from 'cheerio';
import fs from 'fs';

// add return type to the function
let fileName ;

start();

async function start(firstChar, limit) {
	fileName = 'usa_' +firstChar+"_"+ limit + '.csv';
	for (let i = 0; i < limit; i++) {
		getURLs(firstChar+ '/' + i, limit);
	}
}

async function getURLs(search, limit) {
	const html = await fetchWithRetry('https://www.officialusa.com/p/' + search, {
		referrerPolicy: 'strict-origin-when-cross-origin',
		body: null,
		method: 'GET',
	});

	const $ = cheerio.load(await html.text());
	let links = $(
		'div.container.flex-grow-1.mt-5.mb-5 > div.row.border-bottom.pb-3 > div'
	).map((index, element) => {
		return $(element).find('a').attr('href');
	});

	console.log(links.get());
	parseData( links.get());
}

async function parseData(links) {
	const results = [];

	for (let i = 0; i < links.length; i++) {
		// Navigate to the provider detail page
		const page = await fetchWithRetry(
			'https://www.officialusa.com' + links[i],
			{
				referrerPolicy: 'strict-origin-when-cross-origin',
				body: null,
				method: 'GET',
			}
		);

		const $ = cheerio.load(await page.text());
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

			const result = {
				name: name,
				phone: [
					phone.substring(0, 14),
					phone.substring(14, 28),
					phone.substring(28, 42),
				],
			};
			results.push(result);
			fs.appendFileSync(fileName, result.name + ',' + result.phone + '\n');		
			console.log(result);

		});
	}
	return results;

}

async function fetchWithRetry(url, options, maxRetries = 50, delayMs = 2000) {
	let retries = 0;
	while (retries < maxRetries) {
		try {
			return await fetch(url, options);
		} catch (error) {
			console.error('Network error occurred. Retrying...');
			await delay(delayMs);
			retries++;
		}
	}
	throw new Error('Max retries exceeded. Network error persists.');
}

function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
export default start;
