const express = require("express");
const mongodb = require("mongodb");
const router = express.Router();
const MongoClient = require("mongodb").MongoClient;
const options = { useUnifiedTopology: true };
const _ = require("lodash");
const uri =
  "mongodb+srv://wasif4:1234@cluster0-ngfb9.mongodb.net/test?retryWrites=true&w=majority";

//  1. when someone is searching for any state you need to give all the Districts name belongs to that state.
router.get("/state", async (req, res) => {
  try {
    let q = req.query.q;
    console.log(q);
    const states = await getStateData();
    // res.send(await states.findOne({ state: "Maharashtra" }));
    let data = await states.findOne({ state: { $regex: new RegExp(q, "i") } });
    // let data = await states.find({}).toArray();
    var distData = [];
    for (let district1 of data.districts) {
      distData.push({
        state: data.state || null,
        district: district1.district || null,
        district_code: district1.district_code || null
      });
    }
    //res.send(data);
      res.send(distData);
  } catch (err) {
    console.log(`this is the error ${err}`);
    res.send({
      error: "Something went wrong or the Query parameter did not match"
    });
  }
});

// 	2. When someone is searching for any town name you need to return the state and District name belongs to that town.
router.get("/town", async (req, res) => {
  try {
    let q = req.query.q;
    console.log(q);
    const states = await getStateData();
    // below is the query for state
    let stateData = await states.findOne(
      { "districts.towns.town": { $regex: new RegExp(q, "i") } },
      {
        projection: { state: 1, _id: 0 }
      }
    );
    //below  is the query for town
    let districtData = await states.findOne(
      { "districts.towns.town": { $regex: new RegExp(q, "i") } },
      {
        projection: { "districts.towns": 1, _id: 0 }
      }
    );

    let mainTown = null;
    let mainDistrict = null;
    for (let main in districtData.districts) {
      for (let districtT in districtData.districts[main]) {
        for (let town in districtData.districts[main][districtT]) {
          if (districtData.districts[main][districtT][town].town.includes(q)) {
            console.log(districtData.districts[main][districtT][town]);
            mainTown = districtData.districts[main][districtT][town].town;
            mainDistrict = districtData.districts[main][districtT][town].dist;
          }
        }
      }
    }

    let sendData = [
      {
        town: mainTown || null,
        state: stateData.state || null,
        district: mainDistrict || null
      }
    ];
    console.log(sendData);
    res.send(sendData);
  } catch (err) {
    console.log(`this is the error ${err}`);
    res.send({
      error: "Something went wrong or the Query parameter did not match"
    });
  }
});
// 	3. When someone is searching for district you need to return all the Towns belongs to that District.
router.get("/district", async (req, res) => {
  try {
    let q = req.query.q;
    console.log(q);
    const states = await getStateData();
    // below is the field of state and state_code
    let stateData = await states.findOne(
      { "districts.district": { $regex: new RegExp(q, "i") } },
      {
        projection: { state: 1, state_code: 1, _id: 0 }
      }
    );
    // below is the query for districts
    let data = await states.findOne(
      { "districts.district": { $regex: new RegExp(q, "i") } },
      {
        projection: { districts: 1 }
      }
    );
    let sortedData = _.sortBy(data.districts, ["district"]);
    let distData = _.find(sortedData, el => {
      return el.district.includes(q);
    });

    let fixedData = [];
    for (town in distData.towns) {
      fixedData.push({
        town: distData.towns[town].town || null,
        Urban_status: distData.towns[town].urban_status || null,
        State_code: stateData.state_code || null,
        State: stateData.state || null,
        District_code: distData.district_code || null,
        District: distData.district || null
      });
    }
    console.log(fixedData);

    res.send(fixedData);
  } catch (err) {
    console.log(err);
    console.log(`this is the error ${err}`);
    res.send({
      error: "Something went wrong or the Query parameter did not match"
    });
  }
});

module.exports = router;
// method to connect to db and fetch data
async function getStateData() {
  const client = await mongodb.MongoClient.connect(uri, {
    useNewUrlParser: true
  });

  return client.db("node-state-challenge").collection("testdb2");
}

// async function getStateData() {
//   const client = new MongoClient(uri);
//   try {
//     await client.connect();
//     return client.db("node-state-challenge").collection("testdb2");
//   } catch (err) {
//     res.send({ err: err });
//   } finally {
//     // await client.close();
//   }
// }
