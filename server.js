import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

import getData from "./libraries/ga.js";

const app = express();
app.use(express.json())
app.use(cors());

app.get("/api/graph", (req, res) => {
  const { metric } = req.query;
  console.log(`api/graph query: ${metric}`)
  console.log(`Requested graph of metric: ${metric}`);

  let promises = [];
  for (let i = 7; i >= 0; i--) {
    promises.push(getData([metric], `${i}daysAgo`, `${i}daysAgo`));
  }
  promises = [].concat(...promises);
  Promise.all(promises).then((data) => {
    const body = {};
    body[metric] = [];
    Object.values(data).forEach((value) => {
      body[metric].push(
        value[metric.startsWith(":ga") ? metric : `ga:${metric}`]
      );
    });
    console.log(body);
    res.send({data:body});
  })
  .catch( err => {
    console.log(`Error: ${err}`);
    res.send({status: 'Error', message: `${err}`})
  })
});

app.get("/api", (req, res) => {
  const { metrics, startDate, endDate } = req.query;
  console.log(`Requested metrics: ${metrics}`);
  console.log(`Requested start-data: ${startDate}`);
  console.log(`Requested end-date: ${endDate}`);

  Promise.all(
    getData(metrics ? metrics.split(",") : metrics, startDate, endDate)
  )
    .then((data) => {
      const body = {};
      Object.values(data).forEach((value) => {
        Object.keys(value).forEach((key) => {
          body[key] = value[key];
        });
      });
      res.send({ data: body });
    })
    .catch((err) => {
      console.log(`Error: ${err}`);
      res.send({ status: "Error getting metric", message: `${err}` });
    });
});

const port = process.env.SERVER_PORT;

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

app.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
