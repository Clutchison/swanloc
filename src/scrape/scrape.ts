import fs from 'fs';
import config from '../../config.json' assert {type: 'json'}
import puppeteer from 'puppeteer';
import { Event, EVENT_DEF } from '../model/event.js';
import { EVENT_TAG_DEF, EventTag, Tag, TAG_DEF } from '../model/tag.js';
import dummy from '../../testEvents.json' assert {type: 'json'}
import { Dao } from '../model/db/dao.js';

export async function scrapeAndSave() {
  const objs: [Event, Tag[]][] = await scrape(13642);
  const eventDao = Dao.instance(EVENT_DEF);
  const eventTagDao = Dao.instance(EVENT_TAG_DEF);

  const allTags = await Dao.instance(TAG_DEF).getAll<Tag>();
  const tagMap: { [name in string]: number } = {};
  allTags.forEach(t => tagMap[t.name || ''] = t.id || 0);

  objs.forEach(pair => {
    const event = pair[0];
    const tags = pair[1];

    // eventDao.insert<Event>(event);
    tags.forEach(t => {
      // eventTagDao.insert<EventTag>({
      //     tagId: tagMap[t.name] || 0,
      //     eventId: 
      // })
    })
  })


}

export async function scrape(wizId: number): Promise<[Event, Tag[]][]> {

  const dummyEvents: [Event, Tag[]][] = (dummy as [Event, Tag[]][]) || [];
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`https://locator.wizards.com/store/${wizId}`, { waitUntil: 'networkidle2' });

  if (!!config.useDummyScrape) {
    return dummyEvents;
  } else {
    const data: [Event, Tag[]][] = await page.evaluate(() => {
      const res: [Event, Tag[]][] = [];
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
          res.push([{
            name: textFrom(item.querySelector('.event-name')),
            storeWizId: 13642,
            price: parsePrice(textFrom(item.querySelector('.event-fee'))),
            date: parseDate(textFrom(item.querySelector('.event-time')),
              textFrom(item.querySelector('.month')),
              textFrom(item.querySelector('.dayOfMonth'))),
            description: textFrom(item.querySelector('.e-description')),
            isPosted: 0,
          },
          Array.from(item.querySelectorAll('.tags')).map(e => ({ name: textFrom(e) }))
          ]);
        });
      return res;
    });


    console.log(JSON.stringify(data.filter(d => !d[1].find(t => t.name.includes('Commander'))), null, 4));
    fs.writeFile('testEvents.json', JSON.stringify(data, null, 4), (err) => {
      console.log(err);
    })
    await browser.close();
    return data;
  }
}

const selectors: string[] = [
  '.event-name',
  '.event-fee',
  '.event-time',
  '.e-description',
  '.tags',
  '.dayOfWeek',
  '.month',
  '.dayOfMonth',
] as const;
