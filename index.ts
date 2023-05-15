import axios from "axios";
import cheerio from "cheerio";
import { Command } from "commander";

interface Tracker {
  name: string;
}

async function getTrackers(url: string) {
  try {
    // Scrape the WhoTracksMe website for trackers
    const response = await axios.get(
      `https://whotracks.me/websites/${encodeURIComponent(url)}.html`
    );
    const html = response.data;
    const $ = cheerio.load(html);

    // Extract the list of trackers
    const trackers: Tracker[] = [];
    $("body div.container div.list-container div.tab-content div#frequency ul#multi-column-list li a").each((i, element) => {
      const name = $(element).text().replace(/\(.+?\)/g, "").trim();
      trackers.push({ name });
    });

    // Print the list of trackers
    console.log(`Trackers found for ${url}:`);
    if (trackers.length === 0) {
      console.log("None");
    } else {
      // Calciulate the spacing required for the given list  
      const trackerColumns = Math.ceil(trackers.length / 3);
      const trackerChunks = chunkArray(trackers, trackerColumns);
      const maxNameLength = Math.max(...trackers.map((t) => t.name.length));
      const columnWidth = maxNameLength + 2;
      for (let i = 0; i < trackerColumns; i++) {
        let row = "";
        for (let j = 0; j < trackerChunks.length; j++) {
          const tracker = trackerChunks[j][i];
          if (tracker) {
            const paddedName = tracker.name.padEnd(columnWidth, " ");
            row += `${paddedName}`;
          }
        }
        console.log(row.trim());
      }
    }
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
  }
}

function chunkArray<T>(array: T[], chunkSize: number) {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    result.push(chunk);
  }
  return result;
}



const program = new Command();
program
  .arguments("<url>")
  .description("Find trackers on a website.")
  .action((url: string) => {
    getTrackers(url);
  });

program.parse(process.argv);
