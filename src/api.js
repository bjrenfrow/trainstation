import express from 'express';
import { scheduleSchema, timeSchema } from './utils/api-schema.js';
import { getNextMultiTrain, scheduleNextTrain } from './models/schedule.js';
import { initStore } from './utils/schedule.js';
import { TIME_KEYS } from './utils/time.js';
const { PORT } = process.env;

const app = express()

app.use(express.json());

// Init DB on start
initStore({ times: TIME_KEYS });

app.post('/schedule/:trainId', async (req, res, next) => {
  const { schedule } = req.body;
  const { trainId } = req.params;

  try {
    await scheduleSchema.validate({ schedule, trainId });
  } catch (e) {
    return res.json(e.errors);
  }

  try {
    await scheduleNextTrain({ trainId, schedule });
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
});

app.get('/:time', async (req, res, next) => {
  const { time } = req.params;

  try {
    await timeSchema.validate(time);
  } catch (e) {
    return res.json(e.errors);
  }

  try {
    const response = await getNextMultiTrain(time);

    if (!response) {
      return res.sendStatus(404);
    }

    res.send(response);
  } catch (e) {
    next(e);
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
  })
}

export default app;
