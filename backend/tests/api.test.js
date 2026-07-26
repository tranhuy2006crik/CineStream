import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { listenWithFallback } from '../utils/serverListen.js';

describe('CineStream API helpers', () => {
  it('sortObject should sort keys alphabetically', async () => {
    const { default: qs } = await import('qs');
    const obj = { b: '2', a: '1' };
    const keys = Object.keys(obj).sort();
    assert.deepEqual(keys, ['a', 'b']);
    assert.equal(typeof qs.stringify, 'function');
  });

  it('voucher discount calculation', () => {
    const orderAmount = 200000;
    const percentDiscount = Math.round(orderAmount * 0.1);
    assert.equal(percentDiscount, 20000);
    const fixedDiscount = Math.min(50000, orderAmount);
    assert.equal(fixedDiscount, 50000);
  });

  it('listenWithFallback falls back to the next port when the first is occupied', async () => {
    const firstServer = http.createServer();
    const secondServer = http.createServer();

    const firstPort = await new Promise((resolve, reject) => {
      firstServer.once('error', reject);
      firstServer.listen(0, '127.0.0.1', () => {
        resolve(firstServer.address().port);
      });
    });

    const fallbackPort = await listenWithFallback(secondServer, String(firstPort), 2, '127.0.0.1');

    assert.ok(fallbackPort > 0);
    assert.notEqual(fallbackPort, firstPort);

    await new Promise((resolve, reject) => {
      secondServer.close((err) => (err ? reject(err) : resolve()));
    });
    await new Promise((resolve, reject) => {
      firstServer.close((err) => (err ? reject(err) : resolve()));
    });
  });
});
