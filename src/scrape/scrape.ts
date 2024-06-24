import puppeteer from 'puppeteer';

export const scrape = async () => {
  const browser = await puppeteer.launch();

  const page = await browser.newPage();

  await page.goto('https://locator.wizards.com/store/16134', { waitUntil: 'networkidle2' });

  const data = await page.evaluate(() => {
    const res: string[] = [];
    const items = document.querySelectorAll('h3');
    items.forEach(i => res.push(i.textContent?.trim() || ''))
    return res;
  });


  console.log(data);
  await browser.close();
}
