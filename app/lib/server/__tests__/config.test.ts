import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { deleteConfig, getConfig, setConfig } from "../config";

// Helper to create a mock DB with chainable methods
const createMockDb = () => {
  const mockLimit = vi.fn();
  const mockWhere = vi.fn(() => ({ limit: mockLimit }));
  const mockFrom = vi.fn(() => ({ where: mockWhere }));
  const mockSelect = vi.fn(() => ({ from: mockFrom }));

  const mockValues = vi.fn();
  const mockInsert = vi.fn(() => ({ values: mockValues }));

  const mockUpdateWhere = vi.fn();
  const mockSet = vi.fn(() => ({ where: mockUpdateWhere }));
  const mockUpdate = vi.fn(() => ({ set: mockSet }));

  const mockDeleteWhere = vi.fn();
  const mockDelete = vi.fn(() => ({ where: mockDeleteWhere }));

  const db = {
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
  };

  return {
    db: db as unknown as Parameters<typeof getConfig>[0],
    mockLimit,
    mockWhere,
    mockFrom,
    mockSelect,
    mockValues,
    mockInsert,
    mockSet,
    mockUpdate,
    mockUpdateWhere,
    mockDelete,
    mockDeleteWhere,
  };
};

describe("getConfig", () => {
  const schema = z.object({ enabled: z.boolean() });

  it("returns typed value when found", async () => {
    const { db, mockLimit } = createMockDb();
    mockLimit.mockResolvedValue([{ value: { enabled: true } }]);

    const result = await getConfig(db, "feature-flags", schema);

    expect(result).toEqual({ enabled: true });
  });

  it("returns null when key not found", async () => {
    const { db, mockLimit } = createMockDb();
    mockLimit.mockResolvedValue([]);

    const result = await getConfig(db, "nonexistent", schema);

    expect(result).toBeNull();
  });

  it("returns null when Zod validation fails", async () => {
    const { db, mockLimit } = createMockDb();
    mockLimit.mockResolvedValue([{ value: { enabled: "not-a-boolean" } }]);

    const result = await getConfig(db, "bad-data", schema);

    expect(result).toBeNull();
  });
});

describe("setConfig", () => {
  it("inserts new entry when key does not exist", async () => {
    const { db, mockLimit, mockValues } = createMockDb();
    mockLimit.mockResolvedValue([]);

    await setConfig(db, "new-key", { foo: "bar" });

    expect(mockValues).toHaveBeenCalledWith({
      key: "new-key",
      value: { foo: "bar" },
    });
  });

  it("updates existing entry when key exists", async () => {
    const { db, mockLimit, mockSet } = createMockDb();
    mockLimit.mockResolvedValue([{ id: 1 }]);

    await setConfig(db, "existing-key", { foo: "baz" });

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        value: { foo: "baz" },
      }),
    );
  });
});

describe("deleteConfig", () => {
  it("removes entry by key", async () => {
    const { db, mockDeleteWhere } = createMockDb();

    await deleteConfig(db, "remove-me");

    expect(mockDeleteWhere).toHaveBeenCalled();
  });
});
