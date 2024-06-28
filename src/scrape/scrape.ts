import fs from 'fs';
import config from '../../config.json' assert {type: 'json'}
import puppeteer, { Browser } from 'puppeteer';
import { Event, EVENT_DEF } from '../model/event.js';
import { EVENT_TAG_DEF, EventTag, Tag, TAG_DEF } from '../model/tag.js';
import dummy from '../../testEvents.json' assert {type: 'json'}
import { Dao } from '../model/db/dao.js';
import { Store, STORE_DEF } from '../model/store.js';

type ScrapeResult = [Event, Tag[]];
type TagMap = { [name in string]: number };

export async function scrapeAndSave() {
  const stores = await Dao.instance(STORE_DEF).getAll<Store>();

  const tags = await Dao.instance(TAG_DEF).getAll<Tag>();
  const tagMap: TagMap = {};
  tags.forEach(t => tagMap[t.name || ''] = t.id || 0);

  const browser = await puppeteer.launch();
  await delay(1000);

  for (const store of stores) {
    const scraped = await scrape(store.wizId, browser);
    console.log('ScrapeCount: ' + scraped.length);
    await save(scraped, tagMap);
  }

  await browser.close();
}

async function delay(time: number) {
  return new Promise(resolve => setTimeout(resolve, time));
}

async function save(results: ScrapeResult[], tagMap: TagMap): Promise<void> {
  const eventDao = Dao.instance(EVENT_DEF);
  const eventTagDao = Dao.instance(EVENT_TAG_DEF);
  return new Promise<void>((resolve, reject) => {
    results.forEach(pair => {
      const event = pair[0];
      const tags = pair[1];
      eventDao.getBy<Event>(event, 'name', 'date', 'storeWizId')
        .then(existingEvent => {
          console.log(`Event exists: ${JSON.stringify(existingEvent)}`);
        }).catch(_ => {
          console.log('Event does not exist. Saving...')
          eventDao.insert<Event>(event)
            .then(savedEvent => {
              tags.forEach(t => {
                eventTagDao.insert<EventTag>({
                  tagId: tagMap[t.name] || 0,
                  eventId: savedEvent.id || 0,
                }).then(savedET => {
                  console.log(`Saved ET: ${JSON.stringify(savedET)}`);
                })
              })
            })
            .catch(err => {
              console.log(`Error saving object: ${JSON.stringify(event)}`);
              console.log(err);
              reject(err);
            });
        });
    });
    resolve();
  });
}

export async function scrape(wizId: number, browser: Browser): Promise<ScrapeResult[]> {
  console.log('SCRAPING FOR STORE ' + wizId);
  const dummyEvents: ScrapeResult[] = (dummy as ScrapeResult[]) || [];
  const page = await browser.newPage();
  await delay(3000);
  await page.goto(`https://locator.wizards.com/store/${wizId}`, { waitUntil: 'networkidle2' });
  await delay(3000);

  if (!!config.useDummyScrape) {
    return dummyEvents.filter(de => !de[1].map(t => t.name).includes('Commander'));
  } else {
    const data: ScrapeResult[] = await page.evaluate(wizId => {
      const res: ScrapeResult[] = [];
      document.querySelectorAll('.store-info')
        .forEach(item => {
          const parseTime = (t: string): string => {
            const split = t.trim().split(' ');
            if (split[1] === 'pm') {
              const sp = split[0]?.split(':') || [];
              const hours = +(sp[0] || 0) + 12;
              const minutes = sp[1];
              return hours + ':' + minutes;
            } else {
              return split[0] || '';
            }
          }

          const parseDate = (time: string, month: string, date: string): string => {
            const months = [
              'January',
              'February',
              'March',
              'April',
              'May',
              'June',
              'July',
              'August',
              'September',
              'October',
              'November',
              'December',
            ];
            return `2024-${months.findIndex(m => m === month) + 1}-${date} ${parseTime(time)}`;
          }

          const parsePrice = (s: string): number => {
            const split = s.split('.');
            const dollars = split[0]?.substring(1) || 0;
            const cents = split[1] || 0;
            return (+dollars * 100) + (+cents);
          }

          const textFrom = (e: Element | null) => {
            return e?.textContent?.trim() || '';
          }

          const tags = Array.from(item.querySelectorAll('.tags')).map(e => ({ name: textFrom(e) }));
          const name = textFrom(item.querySelector('.event-name'));
          if (!tags.map(t => t.name).includes('Commander') && !!name) res.push([{
            name: name,
            storeWizId: wizId,
            price: parsePrice(textFrom(item.querySelector('.event-fee'))),
            date: parseDate(textFrom(item.querySelector('.event-time')),
              textFrom(item.querySelector('.month')),
              textFrom(item.querySelector('.dayOfMonth'))),
            description: textFrom(item.querySelector('.e-description')),
            isPosted: 0,
          }, tags
          ]);
        });
      return res;
    }, wizId);
    await delay(3000);


    // console.log(JSON.stringify(data.filter(d => !d[1].find(t => t.name.includes('Commander'))), null, 4));
    // fs.writeFile('testEvents.json', JSON.stringify(data, null, 4), (err) => {
    //   console.log(err);
    // })
    return data;
  }
}
