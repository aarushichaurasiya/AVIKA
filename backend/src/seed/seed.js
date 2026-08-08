require('dotenv').config();
const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User');
const Kitchen = require('../models/Kitchen');
const MenuItem = require('../models/MenuItem');

async function seed() {
  await mongoose.connect(env.mongoUrl);
  console.log('Connected. Seeding...');

  await Promise.all([User.deleteMany({}), Kitchen.deleteMany({}), MenuItem.deleteMany({})]);

  const cook = await User.create({
    name: 'Aarushi Chaurasiya',
    email: 'aarushichaurasiya@gmail.com',
    passwordHash: await User.hashPassword('password123'),
    role: 'cook'
  });

  const customer = await User.create({
    name: 'Nitesh Kushwaha',
    email: 'niteshkushwaha@gmail.com',
    passwordHash: await User.hashPassword('password123'),
    role: 'customer',
    addresses: [
      {
        label: 'Home',
        line1: '14 Race Course Road, RS Puram',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        postalCode: '641002',
        lat: 11.0058,
        lng: 76.9646,
        isDefault: true
      }
    ]
  });

  const kitchen = await Kitchen.create({
    owner: cook._id,
    name: "Aarushi's Kitchen",
    cuisine: ['South Indian'],
    description: 'Home-style South Indian thalis and tiffin, cooked fresh every morning.',
    location: {
      type: 'Point',
      coordinates: [76.9558, 11.0138],
      address: 'Race Course, Coimbatore'
    },
    minOrderAmount: 0,
    deliveryFee: 25,
    freeDeliveryThreshold: 300,
    avgPrepTimeMinutes: 30,
    rating: 4.9,
    ratingCount: 320,
    isOpen: true,
    isApproved: true
  });

  await MenuItem.insertMany([
    {
      kitchen: kitchen._id,
      name: 'South Indian Thali',
      description: 'Rice, sambar, rasam, 2 curries, curd, papad',
      category: "Today's tiffin",
      price: 150,
      isVeg: true
    },
    {
      kitchen: kitchen._id,
      name: 'Curd Rice Box',
      description: 'Fresh curd rice with tempering and pickle',
      category: "Today's tiffin",
      price: 90,
      isVeg: true
    },
    {
      kitchen: kitchen._id,
      name: 'Payasam Cup',
      description: 'Semiya payasam, small cup',
      category: 'Sides & extras',
      price: 45,
      isVeg: true
    }
  ]);

  console.log('Seed complete.');
  console.log(`Cook login:     aarushichaurasiya@gmail.com / password123`);
  console.log(`Customer login: niteshkushwaha@gmail.com / password123`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
