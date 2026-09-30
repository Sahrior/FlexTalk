# Sign Language Gloves – integrated project

```
firmware/  Arduino Nano (PlatformIO) – src/main.cpp is UNCHANGED
backend/   Express + MySQL + JWT      – http://localhost:5000
web/       React + Vite               – http://localhost:5173
```

## Data flow
Glove sensors → Arduino prints e.g. `Call doctor` on Serial (9600 baud)
→ web app (Web Serial API, Chrome/Edge) reads the line
→ `POST /api/messages` with the patient's JWT
→ MySQL `messages` table → guardian dashboard polls every 3 s.

## Run
1. MySQL: run `backend/database/schema.sql`
2. Backend: `cd backend && npm install && npm run dev`  (edit `.env` if your DB differs)
3. Web: `cd web && npm install && npm run dev`  → open http://localhost:5173 in **Chrome or Edge**
4. Flash firmware: `cd firmware && pio run -t upload`, then **close the Serial Monitor** (only one program can use the COM port)
5. Sign up a guardian and a patient → patient adds guardian by email → guardian accepts
6. Patient dashboard → **Connect Arduino** → choose the Nano's port

"I need help" and "Call doctor" are saved as `emergency`; the rest as `normal`.
