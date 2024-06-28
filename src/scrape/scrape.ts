import fs from 'fs';
import config from '../../config.json' assert {type: 'json'}
import puppeteer from 'puppeteer';
import { Event, EVENT_DEF } from '../model/event.js';
import { EVENT_TAG_DEF, EventTag, Tag, TAG_DEF } from '../model/tag.js';
import dummy from '../../testEvents.json' assert {type: 'json'}
import { Dao } from '../model/db/dao.js';

export async function scrapeAndSave() {
  const eventDao = Dao.instance(EVENT_DEF);
  const eventTagDao = Dao.instance(EVENT_TAG_DEF);

  const allTags = await Dao.instance(TAG_DEF).getAll<Tag>();
  const tagMap: { [name in string]: number } = {};
  allTags.forEach(t => tagMap[t.name || ''] = t.id || 0);

  const objs: [Event, Tag[]][] = await scrape(13642);
  return new Promise<void>((resolve, reject) => {
    objs.forEach(pair => {
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

export async function scrape(wizId: number): Promise<[Event, Tag[]][]> {

  const dummyEvents: [Event, Tag[]][] = (dummy as [Event, Tag[]][]) || [];
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`https://locator.wizards.com/store/${wizId}`, { waitUntil: 'networkidle2' });

  if (!!config.useDummyScrape) {
    return dummyEvents.filter(de => !de[1].map(t => t.name).includes('Commander'));
  } else {
    const data: [Event, Tag[]][] = await page.evaluate(wizId => {
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

          const tags = Array.from(item.querySelectorAll('.tags')).map(e => ({ name: textFrom(e) }));
          if (!tags.map(t => t.name).includes('Commander')) res.push([{
            name: textFrom(item.querySelector('.event-name')),
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


    console.log(JSON.stringify(data.filter(d => !d[1].find(t => t.name.includes('Commander'))), null, 4));
    fs.writeFile('testEvents.json', JSON.stringify(data, null, 4), (err) => {
      console.log(err);
    })
    await browser.close();
    return data;
  }
}
