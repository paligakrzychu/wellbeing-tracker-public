import { deepStrictEqual, ok, strictEqual, throws } from 'node:assert/strict';
import { describe, it } from 'node:test';

type Address = {
  recipient: string;
  line1: string;
  city: string;
  postcode: string;
  country: string;
};

type Parcel = {
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
};

type ShippingTier = 'standard' | 'express' | 'overnight';

const MAX_PARCEL_KG = 30;
const MAX_PARCEL_CM = 150;

function priceFor(tier: ShippingTier, parcel: Parcel): number {
  if (parcel.weightKg <= 0) {
    throw new RangeError('weight must be greater than zero');
  }
  if (parcel.weightKg > MAX_PARCEL_KG) {
    throw new RangeError(`parcel exceeds ${MAX_PARCEL_KG} kg`);
  }
  const longestSide = Math.max(parcel.lengthCm, parcel.widthCm, parcel.heightCm);
  if (longestSide > MAX_PARCEL_CM) {
    throw new RangeError(`parcel exceeds ${MAX_PARCEL_CM} cm on its longest side`);
  }

  const base: Record<ShippingTier, number> = {
    standard: 4.5,
    express: 9.5,
    overnight: 18,
  };
  return Number((base[tier] + parcel.weightKg).toFixed(2));
}

function formatAddress(address: Address): string {
  return [
    address.recipient,
    address.line1,
    `${address.city} ${address.postcode}`,
    address.country,
  ].join('\n');
}

function deliveryWindow(tier: ShippingTier): string {
  switch (tier) {
    case 'standard':
      return '3-5 working days';
    case 'express':
      return '1-2 working days';
    case 'overnight':
      return 'next working day';
    default: {
      const unreachable: never = tier;
      throw new TypeError(`unknown shipping tier: ${String(unreachable)}`);
    }
  }
}

describe('delivery pricing', () => {
  it('charges the tier base rate plus the parcel weight', () => {
    strictEqual(priceFor('standard', { weightKg: 2, lengthCm: 20, widthCm: 15, heightCm: 10 }), 6.5);
    strictEqual(priceFor('express', { weightKg: 2, lengthCm: 20, widthCm: 15, heightCm: 10 }), 11.5);
    strictEqual(priceFor('overnight', { weightKg: 2, lengthCm: 20, widthCm: 15, heightCm: 10 }), 20);
  });

  it('rounds to a whole number of cents', () => {
    const price = priceFor('standard', { weightKg: 1.234, lengthCm: 20, widthCm: 15, heightCm: 10 });
    strictEqual(price, 5.73);
    strictEqual(Math.round(price * 100), price * 100);
  });

  it('orders tiers from cheapest to most expensive', () => {
    const parcel: Parcel = { weightKg: 5, lengthCm: 30, widthCm: 20, heightCm: 10 };
    ok(priceFor('standard', parcel) < priceFor('express', parcel));
    ok(priceFor('express', parcel) < priceFor('overnight', parcel));
  });

  it('rejects a parcel over the weight limit', () => {
    throws(
      () => priceFor('standard', { weightKg: 30.5, lengthCm: 20, widthCm: 15, heightCm: 10 }),
      /exceeds 30 kg/,
    );
  });

  it('rejects a parcel over the size limit on any side', () => {
    throws(
      () => priceFor('standard', { weightKg: 1, lengthCm: 10, widthCm: 10, heightCm: 151 }),
      /exceeds 150 cm/,
    );
  });

  it('accepts a parcel exactly on both limits', () => {
    strictEqual(
      priceFor('overnight', { weightKg: 30, lengthCm: 150, widthCm: 150, heightCm: 150 }),
      48,
    );
  });

  it('rejects a non-positive weight', () => {
    throws(
      () => priceFor('standard', { weightKg: 0, lengthCm: 20, widthCm: 15, heightCm: 10 }),
      RangeError,
    );
  });
});

describe('delivery addressing', () => {
  const address: Address = {
    recipient: 'Robin Ashdown',
    line1: '14 Wharf Road',
    city: 'Bristol',
    postcode: 'BS1 4RN',
    country: 'United Kingdom',
  };

  it('puts one field per line in a fixed order', () => {
    deepStrictEqual(formatAddress(address).split('\n'), [
      'Robin Ashdown',
      '14 Wharf Road',
      'Bristol BS1 4RN',
      'United Kingdom',
    ]);
  });

  it('keeps the city and postcode together on one line', () => {
    ok(formatAddress(address).includes('Bristol BS1 4RN'));
  });
});

describe('delivery windows', () => {
  it('shortens the window as the tier gets faster', () => {
    const windows = (['standard', 'express', 'overnight'] as ShippingTier[]).map(deliveryWindow);
    deepStrictEqual(windows, ['3-5 working days', '1-2 working days', 'next working day']);
  });
});
