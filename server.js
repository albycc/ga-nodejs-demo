import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

import { getMetric, getDimensions } from "./libraries/ga.js";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/api/metrics", async (req, res) => {
  const { metric, startDate, endDate } = req.query;
  console.log(`Requested metrics: ${metric}`);
  console.log(`Requested start-data: ${startDate}`);
  console.log(`Requested end-date: ${endDate}`);

  const body = await getMetric(`ga:${metric}`, startDate, endDate);

  console.log("body:", body);

  res.send({ data: body });
});

app.get("/api/dimensions", async (req, res) => {
  const {metric, dimension, startDate, endDate } = req.query;
  console.log(`Requested metric: ${metric}`);
  console.log(`Requested dimensions: ${dimension}`);
  console.log(`Requested startDate: ${startDate}`);
  console.log(`Requested endDate: ${endDate}`);

  const body = await getDimensions(`ga:${metric}`, `ga:${dimension}`, startDate, endDate);

  res.send({data: body})
});

const port = process.env.SERVER_PORT;

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

app.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
