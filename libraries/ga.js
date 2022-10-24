import * as dotenv from "dotenv";
dotenv.config();
import {google} from "googleapis";

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

async function getData(data, startDate="30daysAgo", endDate="today"){
  const response = await jwt.authorize();

  // is startDate and endDate not numbers?
  const start =  isNaN(Number(startDate)) ? startDate : `${startDate}daysAgo`;
  const end = isNaN(Number(endDate)) ? endDate : `${endDate}daysAgo`;


  const prop = {
    'auth':jwt,
    'ids':`ga:${viewId}`,
    'start-date':start,
    'end-date':end,
    ...data
  }

  try{
    const result = await analytics.data.ga.get(prop)
    return result;

  }catch(err){
    console.log("There was an error:", err);
    return {errorMessage:err.errors}
  }
}

async function getMetric(metric, startDate, endDate){
  const data = await getData({metrics:metric}, startDate, endDate);

  if(data.errorMessage){
    return data.errorMessage;
  }
  
  const result = {
    value:parseInt(data.data.totalsForAllResults[metric], 10),
    startDate: data.data.query['start-date'],
    endDate: data.data.query['end-date']
  };
  return result
}

async function getDimensions(metric, dimension, startDate, endDate){
  const data = await getData({metrics: metric, dimensions: dimension}, startDate, endDate);
  let rows = data.data.rows;

  if(data.errorMessage){
    return data.errorMessage;
  }

  rows = rows.map(elem =>{ return {dimension: elem[0], value: elem[1]}})

  const result = {
    array:rows,
    startDate: data.data.query['start-date'],
    endDate: data.data.query['end-date']
  }

  return result;

}

export {getMetric, getDimensions}