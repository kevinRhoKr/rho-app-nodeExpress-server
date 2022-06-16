const express = require("express");
const app = express();
const pool = require("./db");
const cors = require("cors");
const md5 = require("md5");

app.use(express.json()); // => req.body
app.use(cors());

// ROUTES

// create a signup
app.post("/user/signup", async (req, res) => {
  try {
    const { email, fname, lname, password } = req.body;

    //check if there's already a user
    const user = await pool.query(
      "SELECT f_name FROM appUsers WHERE email = $1",
      [email]
    );
    console.log(user.rows);

    if (user.rows.length === 0) {
      const newUser = await pool.query(
        "INSERT INTO appUsers (email, f_name, l_name, user_password) VALUES ($1, $2, $3, $4) RETURNING *",
        [email, fname, lname, md5(password)]
      );
      res.json(newUser.rows[0]);
    } else {
      res.json({ status: "fail" });
    }
  } catch (err) {
    console.error(err.message);
  }
});

// log in

app.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);

    const user = await pool.query(
      "SELECT email, user_password FROM appUsers WHERE email = $1 AND user_password = $2",
      [email, md5(password)]
    );

    console.log(user);

    if (user.rows.length == 0) {
      console.log(false);
      res.json({ status: "false" });
    } else {
      console.log(true);
      res.json({ status: "true" });
    }
    //res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// get specific user.
app.post("/user", async (req, res) => {
  try {
    const email = req.body.email;
    console.log(email);

    const user = await pool.query(
      "SELECT email, f_name, l_name FROM appUsers WHERE email = $1",
      [email]
    );
    console.log(user);
    res.json(user.rows[0]);
  } catch (err) {
    console.log(err.message);
  }
});

//

// get all posts
app.get("/posts", async (req, res) => {
  try {
    const query = await pool.query(
      "SELECT post_id, f_name, l_name, date, body, email FROM appUsers NATURAL JOIN apposts"
    );
    res.json(query.rows);
  } catch (err) {
    console.log(err.message);
  }
});

app.post("/posts/new", async (req, res) => {
  const text = req.body.text;
  const email = req.body.email;
  const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");

  try {
    const find_query = await pool.query(
      "SELECT user_id FROM appusers WHERE email = $1",
      [email]
    );

    const user_id = find_query.rows[0].user_id;

    const query = await pool.query(
      "INSERT INTO apposts (user_id, date, body) VALUES ($1, $2, $3) RETURNING *",
      [user_id, currentDate, text]
    );
    res.json(query.rows[0]);
    console.log(query);
  } catch (err) {
    console.log(err.message);
  }
});

app.delete("/posts/delete", async (req, res) => {
  const post_id = req.body.post_id;

  try {
    const delete_query = await pool.query(
      "DELETE FROM apposts WHERE post_id = $1",
      [post_id]
    );
    res.json(delete_query);
  } catch (error) {
    console.log(error);
  }
});

app.put("/posts/update", async (req, res) => {
  const post_id = req.body.post_id;
  const body = req.body.body;
  const date = new Date().toISOString().slice(0, 19).replace("T", " ");

  try {
    const update_query = await pool.query(
      "UPDATE apposts SET body = $1, date = $2 WHERE post_id = $3",
      [body, date, post_id]
    );
    res.json(update_query);
  } catch (error) {
    console.log(error);
  }
});

app.post("/contact/new", async (req, res) => {
  const text = req.body.text;
  const email = req.body.email;

  try {
    const find_user_query = await pool.query(
      "SELECT user_id FROM appusers WHERE email = $1",
      [email]
    );
    const user_id = find_user_query.rows[0].user_id;

    const query = await pool.query(
      "INSERT INTO requests (body, user_id) VALUES ($1, $2) RETURNING *",
      [text, user_id]
    );
    res.json(query.rows[0]);
  } catch (error) {
    console.log(error.message);
  }
});

app.get("/contact/requests", async (req, res) => {
  try {
    const requests_query = await pool.query(
      "SELECT f_name, l_name, email, body FROM requests NATURAL JOIN appusers"
    );
    console.log(requests_query);
    res.json(requests_query.rows);
  } catch (error) {
    console.log(error);
  }
});

app.listen(3000, () => {
  console.log("server is listening on port 3000");
});
