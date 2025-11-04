// index.js
import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import fetch from 'node-fetch'; // do wysyłania webhooka

const app = express();
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'bicie.json'); // {last, timestamp}
const GRUPY = [
  ["Verun","Szonyto","Kobrak","Lootfilter","Obajtek","Dzikie Oko","Janeczek","Zupa","Natural","Szjawir"],
  ["Kuchar","Szonyto","Kobrak","Lother","Obajtek","Wieszak","Janeczek","Zupa","Domci","Zdenek"],
  ["Verun","Szonyto","Kobrak","Wieszak","Obajtek","Dzikie Oko","Janeczek","Zupa","Natural","Szjawir"],
  ["Kuchar","Szonyto","Kobrak","Lother","Obajtek","Lootfilter","Janeczek","Zupa","Domci","Zdenek"]
];
const WEBHOOK_URL = "TU_WSTAW_ULR_WEBHOOK";
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24h

app.post('/api/bicie', async (req, res) => {
  // 1. Pobierz ostatni stan
  let data = { last: 4, timestamp: 0 };
  try { data = await fs.readJson(DATA_FILE); } catch {}
  const teraz = Date.now();
  // 2. Sprawdź czy minął cooldown
  if (teraz - data.timestamp < COOLDOWN_MS) {
    return res.json({ ok: false, msg: 'Bicie już wysłane dzisiaj', grupa: data.last });
  }
  // 3. Zmień grupę naprzemiennie
  const nrNowe = data.last % 4 + 1;
  const grupaNowa = GRUPY[nrNowe - 1];
  // 4. Wyślij wiadomość na Discord
  const tresc = `Bicie ${nrNowe}:\n` + grupaNowa.map((osoba,i)=>`${i+1}. ${osoba}`).join('\n');
  await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: tresc })
  });
  // 5. Zapisz nowy stan
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
