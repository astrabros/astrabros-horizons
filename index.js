import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/horizons", async (req, res) => {
  const { command, start, stop, site } = req.query;

  if (!command || !start || !stop || !site) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const url = new URL("https://ssd.jpl.nasa.gov/api/horizons.api");
  url.searchParams.set("format", "json");
  url.searchParams.set("MAKE_EPHEM", "YES");
  url.searchParams.set("EPHEM_TYPE", "OBSERVER");
  url.searchParams.set("COMMAND", `'${command}'`);
  url.searchParams.set("CENTER", `'coord@399'`);
  url.searchParams.set("COORD_TYPE", `'GEODETIC'`);
  url.searchParams.set("SITE_COORD", `'${site}'`);
  url.searchParams.set("START_TIME", `'${start}'`);
  url.searchParams.set("STOP_TIME", `'${stop}'`);
  url.searchParams.set("R_T_S_ONLY", "YES");
  url.searchParams.set("STEP_SIZE", `'1m GEO'`);
  url.searchParams.set("CSV_FORMAT", "YES");

  const response = await fetch(url.toString());
  const text = await response.text();

  res.type("application/json").send(text);
});

app.listen(3000, () => console.log("Server running"));
