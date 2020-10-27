import express from 'express';
import yup from 'yup';

const { PORT } = process.env;

const app = express()

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// E.G. 6:30PM is 1830
const TIME_REGEX = /[0-9]{4}$/;
const trainSchema = yup.string().trim().min(1).max(4).matches(/[A-Za-z0-9]/);
const timeSchema = yup.string().matches(TIME_REGEX);
const scheduleSchema = yup.object().shape({
  schedule: yup.array().of(timeSchema).required(),
  trainId: trainSchema,
})
const getNextCollisionSchema = yup.object().shape({
  trainId: trainSchema,
  time: timeSchema,
});

app.post('/schedule/:trainId', async (req, res, next) => {
  const { schedule } = req.body;
  const { trainId } = req.params;

  try {
    await scheduleSchema.validate({ schedule, trainId });
  } catch (e) {
    return res.json(e.errors);
  }

  try {
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
});

app.get('/:trainId', async (req, res, next) => {
  const { trainId } = req.params;
  const { time } = req.query;

  try {
    await getNextCollisionSchema.validate({time, trainId});
  } catch (e) {
    return res.json(e.errors);
  }

  try {
    res.send(200);
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
