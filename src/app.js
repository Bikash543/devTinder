const express = require("express");
const connectDB = require("./config/database");

const app = express();
const User = require("./models/user");
const { validateSignUpData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const user = require("./models/user");

const { userAuth } = require("./middleware/auth");

app.use(express.json());
app.use(cookieParser());

// addUser or postuser

app.post("/signup", async (req, res) => {
  try {
    //validation
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    //encryption
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);

    //creating a new instance of user Model
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    await user.save();
    res.send("User added successfully");
  } catch (err) {
    res.status(400).send("error saving the user " + err.message);
  }
});

//login
app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("emailId is not present in DB");
    }
    const isPasswordValid = await user.validatePassword(password)
    if (isPasswordValid) {
      //create a jwt token
      const token = await user.getJWT()

      // add the token to cookie and send the response back

      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
      });

      res.send("login success");
    } else {
      throw new Error("pass is not correct");
    }
  } catch (err) {
    res.status(400).send("error" + err.message);
  }
});

//profile
app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.send(user);
  } catch (err) {
    res.status(400).send("error" + err.message);
  }
});

// send connection request

app.post("/sendConnectionRequest", userAuth, async (req, res) => {
  const user = req.user;
  console.log("sending a connection request");
  res.send(user.firstName + "sent connection request");
});

// get user or find user

app.get("/user", async (req, res) => {
  const userEmail = req.body.emailId;

  try {
    const user = await User.find({ emailId: userEmail });
    if (user.length == 0) {
      res.status(404).send("usernotfound");
    } else {
      res.send(user);
    }
  } catch (err) {
    res.status(400).send("something went error");
  }
});

//get allUsers
app.get("/feed", async (req, res) => {
  try {
    const allUsers = await User.find({});
    res.send(allUsers);
  } catch (err) {
    res.status(400).send("something went wrong");
  }
});

//findbyIdandDelete

app.delete("/delete", async (req, res) => {
  const userId = req.body.userId;

  try {
    const user = await User.findByIdAndDelete(userId);
    res.send("user deleted successfully");
  } catch (err) {
    res.status(400).send("something went wrong");
  }
});

//update user
app.patch("/update/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const data = req.body;

    const ALLOWED_UPDATES = ["photoUrl", "about", "gender", "age", "skills"];

    const isUpdateAllowed =
      data &&
      !Array.isArray(data) &&
      typeof data === "object" &&
      Object.keys(data).length > 0 &&
      Object.keys(data).every((k) => ALLOWED_UPDATES.includes(k));

    if (!isUpdateAllowed) {
      return res.status(400).send("Update is not allowed");
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).select("-password");

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.json(user);
  } catch (err) {
    console.log(err.message);

    if (err.name === "CastError" || err.name === "ValidationError") {
      return res.status(400).send(err.message);
    }

    res.status(500).send("Something went wrong");
  }
});

connectDB()
  .then(() => {
    console.log("database connection established");

    app.listen(3000, () => {
      console.log("Server listening on port 3000");
    });
  })
  .catch((err) => {
    console.log("database connection error");
  });
