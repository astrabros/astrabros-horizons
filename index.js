import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/horizons", async (req, res) => {
  const { command, start, stop, site, mode, tlist } = req.query;

  if (!command || !start || !stop || !site) {
    return res.status(400).json({ error: "Missing parameters: command,start,stop,site" });
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

  url.searchParams.set("CSV_FORMAT", "YES");
  url.searchParams.set("CAL_FORMAT", "CAL");
  url.searchParams.set("TIME_TYPE", "UT");
  url.searchParams.set("ANG_FORMAT", "DEG");

  // mode:
  // - rts  -> solo rise/transit/set (timestamps)
  // - tlist -> tabella su lista tempi (az/alt/ra/dec ecc.)
  const m = (mode || "rts").toLowerCase();

  if (m === "tlist") {
    if (!tlist) return res.status(400).json({ error: "Missing parameter: tlist (comma-separated UTC timestamps)" });
    // TLIST: elenco tempi UTC es. "2026-02-01 18:23,2026-02-01 23:10,..."
    url.searchParams.set("TLIST", `'${tlist}'`);
    // Quantities: chiediamo esplicitamente AZ/EL + RA/DEC.
    // (Horizons può restituire più colonne; noi parsiamo quelle che servono.)
    url.searchParams.set("QUANTITIES", `'4,20,23,24'`);
    url.searchParams.set("R_T_S_ONLY", "NO");
  } else {
    // RTS-only: serve a ricavare gli orari degli eventi
    url.searchParams.set("R_T_S_ONLY", "YES");
    url.searchParams.set("STEP_SIZE", `'1m GEO'`);
    url.searchParams.set("QUANTITIES", `'A'`);
  }

  const response = await fetch(url.toString());
  const text = await response.text();
  res.type("application/json").send(text);
});

app.listen(3000, () => console.log("Server running"));
