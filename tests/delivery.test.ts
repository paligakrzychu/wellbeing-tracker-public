import { describe, expect, it, beforeEach } from "vitest";

import { planDelivery, summariseDelivery } from "../src/delivery";

describe("planDelivery", () => {
  beforeEach(() => {
    // Each test starts from an empty order book state.
  });

  it("splits a request into shipments of at most the max size", () => {
    const shipments = planDelivery({
      orderId: "order-1",
      items: [
        { sku: "a", quantity: 7 },
        { sku: "b", quantity: 4 },
      ],
      maxItemsPerShipment: 10,
    });

    expect(shipments).toHaveLength(2);
    expect(shipments[0].orderId).toBe("order-1");
    expect(shipments[0].items).toEqual([{ sku: "a", quantity: 7 }]);
    expect(shipments[1].items).toEqual([{ sku: "b", quantity: 4 }]);
  });

  it("returns no shipments for an order with no items", () => {
    const shipments = planDelivery({
      orderId: "order-empty",
      items: [],
      maxItemsPerShipment: 5,
    });

    expect(shipments).toEqual([]);
  });

  it("keeps shipment lines numbered in the order they were planned", () => {
    const shipments = planDelivery({
      orderId: "order-2",
      items: [
        { sku: "a", quantity: 1 },
        { sku: "b", quantity: 1 },
        { sku: "c", quantity: 1 },
      ],
      maxItemsPerShipment: 2,
    });

    expect(shipments.map((s) => s.index)).toEqual([0, 1]);
    expect(shipments.map((s) => s.orderId)).toEqual(["order-2", "order-2"]);
  });
});

describe("summariseDelivery", () => {
  it("reports the total item count and shipment count", () => {
    const shipments = planDelivery({
      orderId: "order-3",
      items: [
        { sku: "a", quantity: 3 },
        { sku: "b", quantity: 2 },
        { sku: "c", quantity: 5 },
      ],
      maxItemsPerShipment: 4,
    });

    expect(summariseDelivery(shipments)).toEqual({
      shipmentCount: 2,
      totalItems: 10,
    });
  });

  it("reports zeroes when there is nothing to deliver", () => {
    expect(summariseDelivery([])).toEqual({ shipmentCount: 0, totalItems: 0 });
  });
});
