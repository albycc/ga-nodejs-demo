import * as dotenv from "dotenv";
dotenv.config();
import { google, GoogleApis } from "googleapis";

const email = process.env.CLIENT_EMAIL;
const key = process.env.PRIVATE_KEY.replace(new RegExp("\\\\n"), "\n");
const scopes = ["https://www.googleapis.com/auth/analytics.readonly"];

//Get Google analytics v3
const analytics = google.analytics("v3");
const viewId = process.env.VIEW_ID;
const jwt = new google.auth.JWT({
  email,
  key,
  scopes,
});

//retrieve data
async function getMetric(metric, startDate, endDate) {
  await setTimeout[Object.getOwnPropertySymbols(setTimeout)[0]](
    Math.trunc(1000 * Math.random())
  );

  const result = await analytics.data.ga.get({
    auth: jwt,
    ids: `ga:${viewId}`,
    "start-date": startDate,
    "end-date": endDate,
    metrics: metric,
  });

  const res = {};
  res[metric] = {
    value: parseInt(result.data.totalsForAllResults[metric], 10),
    start:startDate,
    end: endDate,
  }

  return res;
}

//metric does not contains ga:?
function parseMetric(metric){
    let cleanMetric = metric;
    if(!cleanMetric.startsWith('ga:')){
        cleanMetric = `ga:${cleanMetric}`
    }

    return cleanMetric;
}

//Get metrics in batches
function getData(metrics=['ga:users'], startDate='30daysAgo', endDate='today'){
    const results = [];
    for(let i = 0; i < metrics.length; i++){
        const metric = parseMetric(metrics[i]);
        results.push(getMetric(metric, startDate, endDate));
    }

    return results;
}

export default getData;