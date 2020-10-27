import yup from 'yup';

// Custom method to allow an empty array
yup.addMethod(yup.mixed, 'defined', function () {
   return this.test('defined', "{path} must be defined", value => value !== undefined)
})

const trainSchema = yup.string()
  .trim()
  .min(1)
  .max(4)
  .matches(/[A-Za-z0-9]/, 'Train must be alphanumeric and between 1 and 4 characters');

export const timeSchema = yup.string()
  .matches(/^[0-9]{4}$/, 'Time must be in the format HHMM')

export const scheduleSchema = yup.object().shape({
  schedule: yup.array().of(timeSchema).defined(),
  trainId: trainSchema,
});
