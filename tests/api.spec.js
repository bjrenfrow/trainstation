import request from 'supertest';
import chai from 'chai';
import * as db from '../src/models/db.js';
import { initStore } from '../src/utils/schedule.js';

const { expect } = chai;

import api from '../src/api.js';

describe('API', function() {
  describe('Full Acceptance Tests', function() {
    beforeEach(async () => {
      await db.reset();
      await initStore();
    });

    it.only('handle multiple parallel calls', async function() {
      const trains = ['1234', 'ABCD', '90ZD'];

      const responses = await Promise.all([
        request(api).post(`/schedule/${trains[0]}`).send({
          schedule: ['1200', '1600', '1800'],
        }),
        request(api).post(`/schedule/${trains[1]}`).send({
          schedule: ['1200', '1230', '1625'],
        }),
        request(api).post(`/schedule/${trains[2]}`).send({
          schedule: ['1230', '2300', '1110'],
        }),
      ]);

      const response = await request(api).get(`/1200`);

      console.log(response.text);
    });
  });

  describe('POST schedule', function() {
    describe('Validation', function() {
      it('fails if the train id is too long', async function() {
        const trainId = '12345';

        const response = await request(api).post(`/schedule/${trainId}`);

        expect(response.body).to.deep.equal([
          'trainId must be at most 4 characters'
        ]);
      });

      it('fails if the train id is not alphanumeric', async function() {
        const trainId = '<';

        const response = await request(api).post(`/schedule/${trainId}`);

        expect(response.body).to.deep.equal([
          'trainId must match the following: "/[A-Za-z0-9]/"'
        ]);
      });

      it('fails if time is not sent correctly', async function() {
        const response = await request(api)
          .post(`/schedule/1234`)
          .send({ schedule: ['1200 pm'] });

        expect(response.body).to.deep.equal([
          'schedule[0] must match the following: "/[0-9]{4}$/"'
        ]);
      });
    });
  });

  describe('GET by trainId', function() {
    describe('Validation', function() {
      it('must be a valid train Id', async function() {
        const trainId = '12345';

        const response = await request(api).get(`/${trainId}`);

        expect(response.body).to.deep.equal([
          'trainId must be at most 4 characters'
        ]);
      });
    });
  });
});
