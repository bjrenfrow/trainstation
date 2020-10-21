import request from 'supertest';
import chai from 'chai';

const { expect } = chai;

import api from '../src/api.js';

describe('API', function() {
  describe('POST schedule', function() {
    describe('Validation', function() {
      it('fails if the train id is too long', async function() {
        const trainId = '12345';

        const response = await request(api)
          .post(`/schedule/${trainId}`);

        expect(response.body).to.deep.equal([
          'trainId must be at most 4 characters'
        ]);
      });

      it('fails if the train id is not alphanumeric', async function() {
        const trainId = '<';

        const response = await request(api)
          .post(`/schedule/${trainId}`);

        expect(response.body).to.deep.equal([
          'trainId must match the following: \"/[A-Za-z0-9]/\"'
        ]);
      });

      it('fails if time is not sent correctly', async function() {
        const response = await request(api)
          .post(`/schedule/1234`)
          .send({ schedule: ['1234'] });

        expect(response.body).to.deep.equal([
          'schedule[0] must match the following: \"/^(1[0-2]|0?[1-9]):([0-5]?[0-9])\\s([AP]M)?$/\"'
        ]);
      });
    });
  });
});
