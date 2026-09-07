const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedAdmins = async () => {
  try {
    const adminConfigs = [
      {
        username: (process.env.ADMIN_1_USERNAME || 'admin1').trim(),
        password: (process.env.ADMIN_1_PASSWORD || 'admin123').trim(),
      },
      {
        username: (process.env.ADMIN_2_USERNAME || 'admin2').trim(),
        password: (process.env.ADMIN_2_PASSWORD || 'admin123').trim(),
      },
      {
        username: (process.env.ADMIN_3_USERNAME || 'admin3').trim(),
        password: (process.env.ADMIN_3_PASSWORD || 'admin123').trim(),
      },
    ];

    for (const config of adminConfigs) {
      const lowerUsername = config.username.toLowerCase();
      const hashedPassword = await bcrypt.hash(config.password, 10);
      const existingUser = await User.findOne({ username: lowerUsername });

      if (!existingUser) {
        await User.create({
          username: lowerUsername,
          password: hashedPassword,
          role: 'admin',
        });
        console.log(`Seeded new admin user: ${lowerUsername}`);
      } else {
        // Sync password and role in case environment variables or existing hash changed
        existingUser.password = hashedPassword;
        existingUser.role = 'admin';
        await existingUser.save();
        console.log(`Updated admin user credentials: ${lowerUsername}`);
      }
    }
  } catch (err) {
    console.error('Error seeding admin users:', err);
  }
};

module.exports = seedAdmins;
