import Package from '../models/Package.js';

// @desc    Get all packages
// @route   GET /api/packages
// @access  Public
export const getAllPackages = async (req, res) => {
  try {
    const { isActive } = req.query;
    let query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const packages = await Package.find(query).sort({ price: 1 });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách gói cước', error: error.message });
  }
};

// @desc    Get single package
// @route   GET /api/packages/:id
// @access  Public
export const getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ message: 'Không tìm thấy gói cước' });
    }
    res.json(pkg);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// @desc    Create new package
// @route   POST /api/packages
// @access  Private/Admin
export const createPackage = async (req, res) => {
  try {
    const { name, description, price, durationDays, maxResolution, allowedTiers, features, isPopular, isActive } = req.body;

    const newPackage = new Package({
      name,
      description,
      price,
      durationDays,
      maxResolution,
      allowedTiers,
      features,
      isPopular,
      isActive
    });

    const savedPackage = await newPackage.save();
    res.status(201).json(savedPackage);
  } catch (error) {
    res.status(400).json({ message: 'Dữ liệu không hợp lệ', error: error.message });
  }
};

// @desc    Update package
// @route   PUT /api/packages/:id
// @access  Private/Admin
export const updatePackage = async (req, res) => {
  try {
    const { name, description, price, durationDays, maxResolution, allowedTiers, features, isPopular, isActive } = req.body;

    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ message: 'Không tìm thấy gói cước' });
    }

    pkg.name = name || pkg.name;
    pkg.description = description !== undefined ? description : pkg.description;
    pkg.price = price || pkg.price;
    pkg.durationDays = durationDays || pkg.durationDays;
    pkg.maxResolution = maxResolution || pkg.maxResolution;
    pkg.allowedTiers = allowedTiers || pkg.allowedTiers;
    pkg.features = features || pkg.features;
    pkg.isPopular = isPopular !== undefined ? isPopular : pkg.isPopular;
    pkg.isActive = isActive !== undefined ? isActive : pkg.isActive;

    const updatedPackage = await pkg.save();
    res.json(updatedPackage);
  } catch (error) {
    res.status(400).json({ message: 'Dữ liệu không hợp lệ', error: error.message });
  }
};

// @desc    Delete package
// @route   DELETE /api/packages/:id
// @access  Private/Admin
export const deletePackage = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ message: 'Không tìm thấy gói cước' });
    }

    await pkg.deleteOne();
    res.json({ message: 'Đã xóa gói cước' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
