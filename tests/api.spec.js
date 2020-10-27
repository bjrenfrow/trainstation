import MockDate from 'mockdate'
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
      MockDate.set(new Date('2020-10-01'));
    });

    afterEach(function() {
      MockDate.reset();
    });

    it('handles no schedules', async function() {
      const response = await request(api).get(`/1200`);

      expect(response.status).to.equal(404);
      expect(response.text).to.equal('Not Found');
    });

    it('handles a schedule being added and revoked', async function () {
      const trains = ['1234', 'ABCD'];

      await request(api).post(`/schedule/${trains[0]}`).send({
        schedule: ['1300'],
      });

      await request(api).post(`/schedule/${trains[1]}`).send({
        schedule: ['1300'],
      });

      const response1 = await request(api).get(`/1200`);

      expect(response1.status).to.equal(200);
      expect(response1.text).to.equal('2020-10-01T13:00:00.000+00:00');

      await request(api).post(`/schedule/${trains[0]}`).send({
        schedule: [],
      });

      await request(api).post(`/schedule/${trains[1]}`).send({
        schedule: [],
      });

      const response2 = await request(api).get(`/1200`);

      expect(response2.text).to.equal('Not Found');
      expect(response2.status).to.equal(404);
    });


    it('gives a time tomorrow if the provided and next collision are the same time', async function() {
      const trains = ['1234', 'ABCD'];

      await Promise.all([
        request(api).post(`/schedule/${trains[0]}`).send({
          schedule: ['1200'],
        }),
        request(api).post(`/schedule/${trains[1]}`).send({
          schedule: ['1200'],
        }),
      ]);

      const response = await request(api).get(`/1200`);

      expect(response.status).to.equal(200);
      expect(response.text).to.equal('2020-10-02T12:00:00.000+00:00')
    });

    it('handles some basic scenarios', async function() {
      const trains = ['1234', 'ABCD', 'XYZ'];

      await request(api).post(`/schedule/${trains[0]}`).send({
        schedule: ['0010', '1010', '1020', '1210', '1630', '2020'],
      });

      const response1 = await request(api).get(`/1200`);
      expect(response1.status).to.equal(404);

      await request(api).post(`/schedule/${trains[1]}`).send({
        schedule: ['0000', '1111', '2222'],
      });

      const response2 = await request(api).get(`/0300`);
      expect(response2.status).to.equal(404);

      // Collisions Start Here
      await request(api).post(`/schedule/${trains[2]}`).send({
        schedule: ['0010', '0050', '0320', '1111', '1210', '2020', '2300'],
      });

      const response3 = await request(api).get(`/0000`);
      expect(response3.status).to.equal(200);
      expect(response3.text).to.equal('2020-10-01T00:10:00.000+00:00');

      const response4 = await request(api).get(`/1200`);
      expect(response4.status).to.equal(200);
      expect(response4.text).to.equal('2020-10-01T12:10:00.000+00:00');

      const response5 = await request(api).get(`/1800`);
      expect(response5.status).to.equal(200);
      expect(response5.text).to.equal('2020-10-01T20:20:00.000+00:00');

      // tomorrow?
      const response6 = await request(api).get(`/2359`);
      expect(response6.status).to.equal(200);
      expect(response6.text).to.equal('2020-10-02T00:10:00.000+00:00');
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
          'Train must be alphanumeric and between 1 and 4 characters'
        ]);
      });

      it('fails if time is not sent correctly', async function() {
        const response = await request(api)
          .post(`/schedule/1234`)
          .send({ schedule: ['1200 pm'] });

        expect(response.body).to.deep.equal([
          'Time must be in the format HHMM'
        ]);
      });
    });
  });

  describe('GET by time', function() {
    describe('Validation', function() {
      it('must be a valid train Id', async function() {
        const timeId = '12001';

        const response = await request(api).get(`/${timeId}`);

        expect(response.body).to.deep.equal([
          'Time must be in the format HHMM'
        ]);
      });
    });
  });
});
