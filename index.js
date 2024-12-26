import express from "express";
import axios from "axios";
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));

const API_KEY = "ad50eea3790842a1bbfd9c612cb3ad93";

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.post("/icons", (req, res) => {
    if(req.body.icon == "football") {
        res.render("football.ejs");
    } else {
        res.redirect("/");
    }
});

app.post("/league", async (req, res) => {
    const league = req.body.league;
    const currentYear = new Date().getFullYear();
    try {
        const result =await axios.get(`https://api.football-data.org/v4/competitions/${league}/standings` , {
            headers : {
                "X-Auth-Token" : API_KEY
            }
        });

        const result2 = await axios.get(`https://api.football-data.org/v4/competitions/${league}/scorers`, {
            headers : {
                "X-Auth-Token" : API_KEY
            }
        });
        const standing = result.data.standings;
        const table = standing.find(stand => stand.type == 'TOTAL')?.table;
        const scorers = result2.data.scorers;

        res.render("football.ejs", {
            table : table,
            scorers : scorers
        });
    }catch (error) {
        res.status(500).json({
            error: "Failed to fetch league standing. Please try again."
        });
    }
});

app.post("/teams", async (req, res) => {
    try {
        const id = parseInt(req.body.team, 10); 
        if (isNaN(id)) {
            return res.status(400).send({ error: "Invalid team ID format" });
        }
        const result = await axios.get(`https://api.football-data.org/v4/teams/${id}/matches`, {
            headers: {
                "X-Auth-Token": API_KEY,
            },
        });
        const matches = result.data.matches;
        res.render("football.ejs", {
            matches : matches,
        });
    } catch (error) {
        console.error("Error fetching matches:", error.message);
        res.status(500).send({ error: "Failed to fetch matches from the API" });
    }
});

app.listen(port, () => {
    console.log("Server running on: ",port);
});