import express from 'express';
import yup from 'yup';

const { PORT } = process.env;

const app = express()

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// E.G. 9:12 PM
const TIME_REGEX = /^(1[0-2]|0?[1-9]):([0-5]?[0-9])\s([AP]M)?$/;

const timeSchema = yup.string().matches(TIME_REGEX);
const schema = yup.object().shape({
  schedule: yup.array().of(timeSchema).required(),
  trainId: yup.string().trim().min(1).max(4).matches(/[A-Za-z0-9]/).required()
})

app.post('/schedule/:trainId', async (req, res, next) => {
  const { schedule } = req.body;
  const { trainId } = req.params;

  try {
    await schema.validate({ schedule, trainId });
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

  try {
    await schema.validate(trainId);
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
