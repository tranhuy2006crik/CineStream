import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildMomoUrl } from '../controllers/bookingExtrasController.js';

describe('MoMo sandbox flow', () => {
  it('falls back to a local sandbox redirect URL when the gateway call fails', async () => {
    const originalEndpoint = process.env.MOMO_ENDPOINT;
    const originalSandboxMode = process.env.MOMO_SANDBOX_MODE;

    process.env.MOMO_ENDPOINT = 'https://example.invalid/momo';
    process.env.MOMO_SANDBOX_MODE = 'true';

    const redirectUrl = await buildMomoUrl('order-123', 100000, 'Test order');
    const parsed = new URL(redirectUrl);

    assert.equal(parsed.searchParams.get('gateway'), 'momo');
    assert.equal(parsed.searchParams.get('resultCode'), '0');
    assert.equal(parsed.searchParams.get('orderId'), 'order-123');
    assert.ok(parsed.searchParams.get('transId'));

    process.env.MOMO_ENDPOINT = originalEndpoint;
    process.env.MOMO_SANDBOX_MODE = originalSandboxMode;
  });
});
