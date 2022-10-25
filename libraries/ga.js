import * as dotenv from "dotenv";
dotenv.config();
import { google } from "googleapis";

const email = process.env.CLIENT_EMAIL;
const key = process.env.PRIVATE_KEY.replace(new RegExp("\\\\n"), "\n");
const scopes = ["https://www.googleapis.com/auth/analytics.readonly"];
const viewId = process.env.VIEW_ID;

//Get Google analytics v3
const analytics = google.analytics("v3");
let jwt;

async function authorizeAccess() {
  jwt = new google.auth.JWT({
    email,
    key,
    scopes
  });

  const response = await jwt.authorize().catch((err) => {
    console.log("Error authorizing: ", err);
    const {response} = err
    const error = {details:response.data, status:response.status, statusText:response.statusText}
    return error;
  });

  return response;
}

async function getData(data, startDate = "30daysAgo", endDate = "today") {
  // const response = await jwt.authorize();

  // jwt.authorize((err, tokens) => {
  //   if (err) {
  //     console.log("ga.js getData Error authorizing: ", err);
  //     return { error: "Authorization failed." };
  //   }

  // });
  // is startDate and endDate not numbers?
  const start = isNaN(Number(startDate)) ? startDate : `${startDate}daysAgo`;
  const end = isNaN(Number(endDate)) ? endDate : `${endDate}daysAgo`;

  if (!jwt) {
    return {
      error: "Unauthorized. Call authorizeAccess before requesting api.",
    };
  }

  try {
    const result = await analytics.data.ga.get({
      auth: jwt,
      ids: `ga:${viewId}`,
      "start-date": start,
      "end-date": end,
      ...data,
    });
    return result;
  } catch (err) {
    const { response } = err;
    console.log("There was an error \n", err);
    return {
      error: response.data.error.message,
      status: response.status,
      statusText: response.statusText,
    };
  }
}

async function getMetric(metric, startDate, endDate) {
  const data = await getData({ metrics: metric }, startDate, endDate);

  if (data.error) {
    return data;
  }

  const result = {
    value: parseInt(data.data.totalsForAllResults[metric], 10),
    startDate: data.data.query["start-date"],
    endDate: data.data.query["end-date"],
  };
  return result;
}

async function getDimensions(metric, dimension, startDate, endDate) {
  const data = await getData(
    { metrics: metric, dimensions: dimension },
    startDate,
    endDate
  );

  if (data.error) {
    return data;
  }

  let rows = data.data.rows;

  rows = rows.map((elem) => {
    return { dimension: elem[0], value: elem[1] };
  });

  const result = {
    array: rows,
    startDate: data.data.query["start-date"],
    endDate: data.data.query["end-date"],
  };

  return result;
}

export { authorizeAccess, getMetric, getDimensions };
