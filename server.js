const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

var corsOptions = {
  origin: "http://localhost:4200"
};

const app = express();

const path = __dirname + '/views/';
app.use(express.static(path));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(corsOptions));

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

app.get("/", (req, res) => {
  res.sendFile(path + "index.html");
});

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://tyao_admin:rriveryth7@cluster-telus-ehs.4nek4.mongodb.net/hdb?retryWrites=true&w=majority',
{useNewUrlParser: true, useUnifiedTopology: true});

const Contest = mongoose.model('Contest', { name: String, csts: [{name: String, odds: Number}], over: Boolean, wnrs: [String]});
const History = mongoose.model('History', { contestName: String, cst: {name: String, odds: Number}, riskAmount: Number});

Contest.deleteMany({}).then();
History.deleteMany({}).then();

app.get("/admin/contests", (req, res) => {
    Contest.find( (err, foundContests) => {
        //console.log(foundCats);
        res.send(foundContests);
    });
})

app.get("/contests", (req, res) => {
    Contest.find( { over: false}, (err, foundContests) => {
        //console.log(foundCats);
        res.send(foundContests);
    });
})


app.post("/admin/contests", (req, res) => {
    const c = new Contest({name: req.body.name, csts: req.body.csts, over: false, wnrs: []});
    c.save();
    res.send({message: "no problem!"});
})

app.put("/admin/contests/:id", (req, res) => {
    const id = req.params.id;
    console.log(req.body);
    Contest.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
      .then(data => {
        if (!data) {
          res.status(404).send({
            message: `Cannot update Contest with id=${id}. Maybe Contest was not found!`
          });
      } else res.send({ message: "Contest was updated successfully." });
      })
      .catch(err => {
        res.status(500).send({
          message: "Error updating Contest with id=" + id
        });
    });
})

app.get("/admin/contests/:id", (req, res) => {

  const id = req.params.id;

  Contest.findById(id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found contest with id " + id });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving contest with id=" + id });
    });
});

app.delete("/admin/contests", (req, res) => {
    Contest.deleteMany({})
  .then(data => {
    res.send({
      message: `${data.deletedCount} Contests were deleted successfully!`
    });
  })
  .catch(err => {
    res.status(500).send({
      message:
        err.message || "Some error occurred while removing all contests."
    });
  });
})

app.delete("/admin/contests/:id", (req, res) => {

    const id = req.params.id;

    Contest.findByIdAndRemove(id, {useFindAndModify: false })
      .then(data => {
        if (!data) {
          res.status(404).send({
            message: `Cannot delete contest with id=${id}. Maybe contest was not found!`
          });
        } else {
          res.send({
            message: "Contest was deleted successfully!"
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete Contest with id=" + id
        });
      });
});

app.post("/history", (req, res) => {
    const h = new History({contestName: req.body.contestName, cst: req.body.cst, riskAmount: req.body.riskAmount});
    console.log(req.body.riskAmount)
    h.save();
    res.send({message: "no problem!"});
})

app.get("/history", (req, res) => {
    History.find((err, foundHistory) => {
        //console.log(foundCats);
        res.send(foundHistory);
    });
})

app.delete("/history", (req, res) => {
    History.deleteMany({})
  .then(data => {
    res.send({
      message: `${data.deletedCount} History was deleted successfully!`
    });
  })
  .catch(err => {
    res.status(500).send({
      message:
        err.message || "Some error occurred while removing all contests."
    });
  });
})

app.post("/history/checkWL", (req, res) => {
  const name = req.body.name;
  Contest.find( { name: name}, (err, foundHistory) => {
      //console.log(foundCats);
      res.send(foundHistory[0].wnrs);
  });
});
