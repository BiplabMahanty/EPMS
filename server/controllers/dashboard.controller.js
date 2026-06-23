const Employee = require('../models/Employee');
const Product = require('../models/Product');
const Party = require('../models/Party');

const getDashboardCounts = async (req, res) => {
  try {
    const businessId = req.user.businessId;

    const [
      employees,
      products,
      customers,
      suppliers,
    ] = await Promise.all([
      Employee.countDocuments({ businessId }),

      Product.countDocuments({ businessId }),

      Party.countDocuments({
        businessId,
        type: { $in: ['customer', 'both'] },
      }),

      Party.countDocuments({
        businessId,
        type: { $in: ['supplier', 'both'] },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        employees,
        products,
        customers,
        suppliers,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard counts',
    });
  }
};

module.exports = {
  getDashboardCounts,
};