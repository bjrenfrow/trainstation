import express from 'express';
import yup from 'yup';
import { getNextMultiTrain, scheduleNextTrain } from './models/schedule.js';
import { initStore } from './utils/schedule.js';
import { TIME_KEYS } from './utils/time.js';
const { PORT } = process.env;

const app = express()

app.use(express.json());

// Init DB on start
initStore({ times: TIME_KEYS });

// E.G. 6:30PM is 1830
const TIME_REGEX = /[0-9]{4}$/;
const trainSchema = yup.string().trim().min(1).max(4).matches(/[A-Za-z0-9]/);
const timeSchema = yup.string().matches(TIME_REGEX);
const scheduleSchema = yup.object().shape({
  schedule: yup.array().of(timeSchema).required(),
  trainId: trainSchema,
})

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
