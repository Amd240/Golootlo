const { adminOnly } = require("../middleware/admin");

describe("adminOnly middleware", () => {
  const buildRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  test("calls next() when req.user.isAdmin is true", () => {
    const req = { user: { isAdmin: true } };
    const res = buildRes();
    const next = jest.fn();

    adminOnly(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test("returns 403 when req.user.isAdmin is false", () => {
    const req = { user: { isAdmin: false } };
    const res = buildRes();
    const next = jest.fn();

    adminOnly(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringMatching(/admin/i) })
    );
  });

  test("returns 403 when req.user is missing entirely", () => {
    const req = {};
    const res = buildRes();
    const next = jest.fn();

    adminOnly(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
