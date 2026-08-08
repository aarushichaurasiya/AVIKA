const Kitchen = require('../models/Kitchen');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');

// GET /api/kitchens?lat=&lng=&radiusKm=&cuisine=&search=&page=&limit=
const listKitchens = asyncHandler(async (req, res) => {
  const {
    lat,
    lng,
    radiusKm = 5,
    cuisine,
    search,
    page = 1,
    limit = 20
  } = req.query;

  // Base filters
  const baseQuery = {
    isApproved: true,
    isOpen: true
  };

  if (cuisine) baseQuery.cuisine = cuisine;
  if (search) baseQuery.$text = { $search: search };

  const query = { ...baseQuery };
  const countQuery = { ...baseQuery };

  // Nearby-kitchen filtering
  if (lat && lng) {
    const coordinates = [Number(lng), Number(lat)];
    const radiusMeters = Number(radiusKm) * 1000;

    // Used by Kitchen.find()
    // $near sorts kitchens by distance automatically.
    query.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: radiusMeters
      }
    };

    // Used by countDocuments()
    // $near cannot be used here, so use $geoWithin.
    countQuery.location = {
      $geoWithin: {
        $centerSphere: [
          coordinates,
          radiusMeters / 6378100
        ]
      }
    };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [kitchens, total] = await Promise.all([
    Kitchen.find(query)
      .skip(skip)
      .limit(Number(limit)),

    Kitchen.countDocuments(countQuery)
  ]);

  sendSuccess(res, 200, kitchens, {
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / Number(limit))
  });
});

// GET /api/kitchens/:id
const getKitchen = asyncHandler(async (req, res) => {
  const kitchen = await Kitchen.findById(req.params.id);

  if (!kitchen) {
    throw ApiError.notFound('Kitchen not found');
  }

  sendSuccess(res, 200, kitchen);
});

// POST /api/kitchens
// A cook creates their kitchen profile (requires role: cook)
const createKitchen = asyncHandler(async (req, res) => {
  const kitchen = await Kitchen.create({
    ...req.body,
    owner: req.user._id
  });

  sendSuccess(res, 201, kitchen);
});

// PATCH /api/kitchens/:id
const updateKitchen = asyncHandler(async (req, res) => {
  const kitchen = await Kitchen.findById(req.params.id);

  if (!kitchen) {
    throw ApiError.notFound('Kitchen not found');
  }

  const isOwner =
    kitchen.owner.toString() === req.user._id.toString();

  if (!isOwner && req.user.role !== 'admin') {
    throw ApiError.forbidden('You can only edit your own kitchen');
  }

  Object.assign(kitchen, req.body);

  await kitchen.save();

  sendSuccess(res, 200, kitchen);
});

// GET /api/kitchens/admin/all?status=pending|approved
// Admin only, unfiltered by isApproved
const listAllKitchensAdmin = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const query = {};

  if (status === 'pending') {
    query.isApproved = false;
  }

  if (status === 'approved') {
    query.isApproved = true;
  }

  const kitchens = await Kitchen.find(query)
    .sort('-createdAt')
    .populate('owner', 'name email');

  sendSuccess(res, 200, kitchens);
});

// PATCH /api/kitchens/:id/approve
// Admin only
const approveKitchen = asyncHandler(async (req, res) => {
  const kitchen = await Kitchen.findById(req.params.id);

  if (!kitchen) {
    throw ApiError.notFound('Kitchen not found');
  }

  kitchen.isApproved =
    req.body.isApproved !== undefined
      ? Boolean(req.body.isApproved)
      : true;

  await kitchen.save();

  sendSuccess(res, 200, kitchen);
});

// POST /api/kitchens/:id/employees
// Owner/admin only
const addEmployee = asyncHandler(async (req, res) => {
  const kitchen = await Kitchen.findById(req.params.id);

  if (!kitchen) {
    throw ApiError.notFound('Kitchen not found');
  }

  if (
    kitchen.owner.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden(
      'You can only manage your own kitchen\'s team'
    );
  }

  kitchen.employees.push({
    name: req.body.name,
    role: req.body.role,
    phone: req.body.phone
  });

  await kitchen.save();

  sendSuccess(res, 201, kitchen.employees);
});

// DELETE /api/kitchens/:id/employees/:employeeId
const removeEmployee = asyncHandler(async (req, res) => {
  const kitchen = await Kitchen.findById(req.params.id);

  if (!kitchen) {
    throw ApiError.notFound('Kitchen not found');
  }

  if (
    kitchen.owner.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden(
      'You can only manage your own kitchen\'s team'
    );
  }

  kitchen.employees = kitchen.employees.filter(
    (e) => e._id.toString() !== req.params.employeeId
  );

  await kitchen.save();

  sendSuccess(res, 200, kitchen.employees);
});

// GET /api/kitchens/mine
// The logged-in cook's own kitchen
const myKitchen = asyncHandler(async (req, res) => {
  const kitchen = await Kitchen.findOne({
    owner: req.user._id
  });

  if (!kitchen) {
    throw ApiError.notFound(
      'You have not set up a kitchen yet'
    );
  }

  sendSuccess(res, 200, kitchen);
});

module.exports = {
  listKitchens,
  getKitchen,
  createKitchen,
  updateKitchen,
  listAllKitchensAdmin,
  approveKitchen,
  addEmployee,
  removeEmployee,
  myKitchen
};