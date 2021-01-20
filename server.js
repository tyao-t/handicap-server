const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

var corsOptions = {
  origin: "http://localhost:8080"
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
mongoose.connect('mongodb+srv://tyao_admin:rriveryth7@cluster-telus-ehs.4nek4.mongodb.net/ehsdb2?retryWrites=true&w=majority', 
{useNewUrlParser: true, useUnifiedTopology: true});

const Patient = mongoose.model('Patient', { name: String, encs: [String], allowedEncs: [String]});

app.get("/hello", (req, res) => {
    Patient.find( (err, foundPatients) => {
        //console.log(foundCats);
        res.send(foundPatients);
    });
})

app.post("/", (req, res) => {
    const p = new Patient({name: req.body.name, encs: req.body.encs, allowedEncs: req.body.encs});
    p.save();
    res.send({message: "no problem!"});
})

app.put("/patients/:id", (req, res) => {
    const id = req.params.id;
    console.log(req.body);
    Patient.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
      .then(data => {
        if (!data) {
          res.status(404).send({
            message: `Cannot update Patient with id=${id}. Maybe Patient was not found!`
          });
      } else res.send({ message: "Patient was updated successfully." });
      })
      .catch(err => {
        res.status(500).send({
          message: "Error updating Patient with id=" + id
        });
    });
})

app.get("/patients/:id", (req, res) => {

  const id = req.params.id;

  Patient.findById(id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found patient with id " + id });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving patient with id=" + id });
    });
});

app.delete("/patients", (req, res) => {
    Patient.deleteMany({})
  .then(data => {
    res.send({
      message: `${data.deletedCount} Patients were deleted successfully!`
    });
  })
  .catch(err => {
    res.status(500).send({
      message:
        err.message || "Some error occurred while removing all patients."
    });
  });
})

app.delete("/patients/:id", (req, res) => {

    const id = req.params.id;

    Patient.findByIdAndRemove(id, {useFindAndModify: false })
      .then(data => {
        if (!data) {
          res.status(404).send({
            message: `Cannot delete Patient with id=${id}. Maybe Patient was not found!`
          });
        } else {
          res.send({
            message: "Patient was deleted successfully!"
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete Patient with id=" + id
        });
      });
});
