import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rentalHandoffQuery, rentalReturnPath } from '../app/utils/rentalHandoff.ts';
test('rental intent accepts real ordered dates and bounded units only', () => {
  assert.deepEqual(rentalHandoffQuery({ dateFrom: '2026-12-01', dateTo: '2026-12-05', unitsNeeded: '2', redirect: '//evil.test' }), { dateFrom: '2026-12-01', dateTo: '2026-12-05', unitsNeeded: '2' });
  for (const dateFrom of ['2026-02-30', '2026-12-06', 'not-date']) assert.deepEqual(rentalHandoffQuery({ dateFrom, dateTo: '2026-12-05', unitsNeeded: '-1' }), {});
  assert.deepEqual(rentalHandoffQuery({ unitsNeeded: '10001' }), {});
});
test('post-login target allows selected object only; removes unsupported query', () => {
  const path = '/rental-item/' + 'a'.repeat(24);
  assert.equal(rentalReturnPath(path + '?unitsNeeded=2&redirect=https://evil.test'), path + '?unitsNeeded=2');
  for (const value of ['//evil.test', 'https://evil.test', path + '/../../admin', '/admin', path + 'suffix']) assert.equal(rentalReturnPath(value), '/cabinet');
});
