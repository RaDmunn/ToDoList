import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";

const app = express();
const port = 3000;

env.config();

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM items ORDER BY id ASC");
    items = result.rows;

    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/add", (req, res) => {
  const newItem = req.body.newItem;

  // Execute SQL query to insert a new item into the database
  db.query('INSERT INTO items (title) VALUES ($1)', [newItem], (err, result) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).send('Server error');
    } else {
      console.log('Item successfully added to the database');
      res.redirect("/");
    }
  });
});

app.post("/edit", async (req, res) => {
  const item = req.body.updatedItemTitle;
  const id = req.body.updatedItemId;

  try {
    await db.query("UPDATE items SET title = ($1) WHERE id = $2", [item, id]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.post("/delete", (req, res) => {
  const itemId = req.body.deleteItemId;

  // Execute SQL query to delete an item from the database by its ID
  db.query('DELETE FROM items WHERE id = $1', [itemId], (err, result) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).send('Server error');
    } else {
      res.redirect("/");
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});