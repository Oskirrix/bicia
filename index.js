import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import fetch from 'node-fetch';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors()); // <--- Dla Tampermonkey/globalnego fetch()
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'bicie.json');
const GRUPY = [
  ["Verun","Szonyto","Kobrak","Lootfilter","Obajtek","Dzikie Oko","Janeczek","Zupa","Natural","Szjawir"],
  ["Kuchar","Szonyto","Kobrak","Lother","Obajtek","Wieszak","Janeczek","Zupa","Domci","Zdenek"],
  ["Verun","Szonyto","Kobrak","Wieszak","Obajtek","Dzikie Oko","Janeczek","Zupa","Natural","Szjawir"],
  ["Kuchar","Szonyto","Kobrak","Lother","Obajtek","Lootfilter","Janeczek","Zupa","Domci","Zdenek"]
];
// PODMIEN na swój webhook Discord:
const WEBHOOK_URL = "TU_WSTAW_ULR_WEBHOOK";
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

app.post('/api/bicie', async (req, res) => {
  let data = { last: 4, timestamp: 0 };
  try { data = await fs.readJson(DATA_FILE); } catch {}
  const teraz = Date.now();
  if (teraz - data.timestamp < COOLDOWN_MS) {
    return res.json({ ok: false, msg: 'Bicie już wysłane dzisiaj', grupa: data.last });
  }
  const nrNowe = data.last % 4 + 1;
  const grupaNowa = GRUPY[nrNowe - 1];
  const tresc = `Bicie ${nrNowe}:\n` + grupaNowa.map((osoba,i)=>`${i+1}. ${osoba}`).join('\n');
  await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: tresc })
  });
  await fs.writeJson(DATA_FILE, { last: nrNowe, timestamp: teraz });
  res.json({ ok: true, grupa: nrNowe });
});

app.get('/api/bicie', async (req, res) => {
  let data = { last: 4, timestamp: 0 };
  try { data = await fs.readJson(DATA_FILE); } catch {}
  res.json(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Bicie backend działa na porcie', PORT));
