import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

import { authorizeAccess, getMetric, getDimensions } from "./libraries/ga.js";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/accessToken", async (req, res) => {
  console.log("accessToken called")

  const response = await authorizeAccess();

  console.log("response: ", response);

  res.send({response})

})

app.get("/api/metrics", async (req, res) => {
  const { metric, startDate, endDate } = req.query;
  console.log("Requested route /api/metrics");
  console.log(`Requested metrics: ${metric}`);
  console.log(`Requested start-data: ${startDate}`);
  console.log(`Requested end-date: ${endDate}`);

  const body = await getMetric(`ga:${metric}`, startDate, endDate);

  if(body.error){
    res.status(body.status || 400).json({body})
    return;
  }

  res.send({ data: body });
});

app.get("/api/dimensions", async (req, res) => {
  const {metric, dimension, startDate, endDate } = req.query;
  console.log("Requested route /api/dimensions");
  console.log(`Requested metric: ${metric}`);
  console.log(`Requested dimensions: ${dimension}`);
  console.log(`Requested startDate: ${startDate}`);
  console.log(`Requested endDate: ${endDate}`);

  const body = await getDimensions(`ga:${metric}`, `ga:${dimension}`, startDate, endDate);

  if(body.error){
    res.status(body.status || 400).json({body})
    return;
  }

  res.send({data: body})
});

const port = process.env.SERVER_PORT || 8080;

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

app.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
