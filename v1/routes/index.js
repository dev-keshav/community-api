var express = require("express");
var router = express.Router();
var User = require("../../models/user");

const bodyParser = require("body-parser");
const app = express();

var Community = require("../../models/communityModel");
var Membership = require("../../models/membershipModel");

// Parse JSON data from the request body
app.use(bodyParser.json());


// Create a new community
router.post("/community", function (req, res, next) {
  const { name, description } = req.body;

  if (!name || !description) {
    return res
      .status(400)
      .send({ Error: "Community name and description are required." });
  }

  // Create a new community and save it to the database
  const newCommunity = new Community({ name, description }); // Include the description

  newCommunity.save((err, community) => {
    if (err) {
      console.error("Error when creating a community:", err); // Debugging: Log the error
      return res.status(500).send({ Error: "Failed to create the community." });
    }

    console.log("Community created successfully"); // Debugging: Log success

    // Once the community is created, add the current user as the owner (or admin)
    const membership = new Membership({
      userId: req.session.userId, // Assuming you store the user's ID in the session
      communityId: community._id,
      role: "owner", // You can set the initial role here (e.g., owner, member, etc.)
    });

    membership.save((err) => {
      if (err) {
        console.error("Error when adding a member:", err); // Debugging: Log the error
        return res
          .status(500)
          .send({ Error: "Failed to add you as a member of the community." });
      }

      console.log("Member added successfully"); // Debugging: Log success

      return res
        .status(201)
        .send({ Success: "Community created successfully." });
    });
  });
});


  
  
  
  
  



// List all communities
router.get("/community", function (req, res, next) {
  Community.find({}, (err, communities) => {
    if (err) {
      return res.status(500).send({ Error: "Failed to retrieve communities." });
    }

    return res.status(200).send(communities);
  });
});

// Add a user as a member to a community
router.post("/addMember", function (req, res, next) {
  const { userId, communityId, role } = req.body;

  if (!userId || !communityId || !role) {
    return res.status(400).send({ Error: "Missing required parameters." });
  }

  // Check if the current user has the necessary permissions to add members
  // This is where you would implement your authorization logic

  const membership = new Membership({ userId, communityId, role });

  membership.save((err) => {
    if (err) {
      return res
        .status(500)
        .send({ Error: "Failed to add the member to the community." });
    }

    return res
      .status(201)
      .send({ Success: "Member added to the community successfully." });
  });
});

// Remove a member from a community
router.post("/removeMember", function (req, res, next) {
  const { userId, communityId } = req.body;

  if (!userId || !communityId) {
    return res.status(400).send({ Error: "Missing required parameters." });
  }

  // Check if the current user has the necessary permissions to remove members
  // This is where you would implement your authorization logic

  Membership.deleteOne({ userId, communityId }, (err) => {
    if (err) {
      return res
        .status(500)
        .send({ Error: "Failed to remove the member from the community." });
    }

    return res
      .status(200)
      .send({ Success: "Member removed from the community successfully." });
  });
});





router.get("/auth/signup", function (req, res, next) {
  return res.render("index.ejs");
});

router.post("/auth/signup", function (req, res, next) {
  console.log(req.body);
  var personInfo = req.body;

  if (
    !personInfo.email ||
    !personInfo.username ||
    !personInfo.password ||
    !personInfo.passwordConf
  ) {
    res.send();
  } else {
    if (personInfo.password == personInfo.passwordConf) {
      User.findOne({ email: personInfo.email }, function (err, data) {
        if (!data) {
          var c;
          User.findOne({}, function (err, data) {
            if (data) {
              console.log("if");
              c = data.unique_id + 1;
            } else {
              c = 1;
            }

            var newPerson = new User({
              unique_id: c,
              email: personInfo.email,
              username: personInfo.username,
              password: personInfo.password,
              passwordConf: personInfo.passwordConf,
            });

            newPerson.save(function (err, Person) {
              if (err) console.log(err);
              else console.log("Success");
            });
          })
            .sort({ _id: -1 })
            .limit(1);
          res.send({ Success: "You are regestered,You can login now." });
        } else {
          res.send({ Success: "Email is already used." });
        }
      });
    } else {
      res.send({ Success: "password is not matched" });
    }
  }
});

router.get("/auth/signin", function (req, res, next) {
  return res.render("login.ejs");
});

router.post("/auth/signin", function (req, res, next) {
  //console.log(req.body);
  User.findOne({ email: req.body.email }, function (err, data) {
    if (data) {
      if (data.password == req.body.password) {
        //console.log("Done Login");
        req.session.userId = data.unique_id;
        //console.log(req.session.userId);
        res.send({ Success: "Success!" });
      } else {
        res.send({ Success: "Wrong password!" });
      }
    } else {
      res.send({ Success: "This Email Is not regestered!" });
    }
  });
});

router.get("/auth/me", function (req, res, next) {
  console.log("profile");
  User.findOne({ unique_id: req.session.userId }, function (err, data) {
    console.log("data");
    console.log(data);
    if (!data) {
      res.redirect("/v1/auth/signup");
    } else {
      //console.log("found");
      return res.render("data.ejs", { name: data.username, email: data.email });
    }
  });
});

router.get("/auth/logout", function (req, res, next) {
  console.log("logout");
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect("/v1/auth/signup");
      }
    });
  }
});

router.get("/forgetpass", function (req, res, next) {
  res.render("forget.ejs");
});

router.post("/forgetpass", function (req, res, next) {
  //console.log('req.body');
  //console.log(req.body);
  User.findOne({ email: req.body.email }, function (err, data) {
    console.log(data);
    if (!data) {
      res.send({ Success: "This Email Is not regestered!" });
    } else {
      // res.send({"Success":"Success!"});
      if (req.body.password == req.body.passwordConf) {
        data.password = req.body.password;
        data.passwordConf = req.body.passwordConf;

        data.save(function (err, Person) {
          if (err) console.log(err);
          else console.log("Success");
          res.send({ Success: "Password changed!" });
        });
      } else {
        res.send({
          Success: "Password does not matched! Both Password should be same.",
        });
      }
    }
  });
});

module.exports = router;
