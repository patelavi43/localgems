require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const TalentProfile = require('../models/TalentProfile.model');
const Booking = require('../models/Booking.model');
const Review = require('../models/Review.model');

const connectDB = require('../config/database');

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    TalentProfile.deleteMany({}),
    Booking.deleteMany({}),
    Review.deleteMany({}),
  ]);

  // Create users
  const adminUser = await User.create({
    name: 'Admin User', email: 'admin@localgems.com', password: 'password123',
    role: 'Admin', phone: '+91-98765-00001',
    location: { city: 'Delhi', state: 'Delhi', country: 'India' },
  });

  const clients = await User.create([
    { name: 'Priya Sharma', email: 'priya@example.com', password: 'password123', role: 'Client', phone: '+91-98765-10001', location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' } },
    { name: 'Rahul Verma', email: 'rahul@example.com', password: 'password123', role: 'Client', phone: '+91-98765-10002', location: { city: 'Bangalore', state: 'Karnataka', country: 'India' } },
    { name: 'Anjali Patel', email: 'anjali@example.com', password: 'password123', role: 'Client', phone: '+91-98765-10003', location: { city: 'Pune', state: 'Maharashtra', country: 'India' } },
  ]);

  const talentUsers = await User.create([
    { name: 'Arjun Kapoor', email: 'arjun@example.com', password: 'password123', role: 'TalentProvider', phone: '+91-98765-20001', profile_pic: 'https://i.pravatar.cc/150?img=11', location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' } },
    { name: 'Shreya Nair', email: 'shreya@example.com', password: 'password123', role: 'TalentProvider', phone: '+91-98765-20002', profile_pic: 'https://i.pravatar.cc/150?img=5', location: { city: 'Delhi', state: 'Delhi', country: 'India' } },
    { name: 'Virat Singh', email: 'virat@example.com', password: 'password123', role: 'TalentProvider', phone: '+91-98765-20003', profile_pic: 'https://i.pravatar.cc/150?img=12', location: { city: 'Bangalore', state: 'Karnataka', country: 'India' } },
    { name: 'Kavya Reddy', email: 'kavya@example.com', password: 'password123', role: 'TalentProvider', phone: '+91-98765-20004', profile_pic: 'https://i.pravatar.cc/150?img=9', location: { city: 'Hyderabad', state: 'Telangana', country: 'India' } },
    { name: 'Rohan Mehta', email: 'rohan@example.com', password: 'password123', role: 'TalentProvider', phone: '+91-98765-20005', profile_pic: 'https://i.pravatar.cc/150?img=15', location: { city: 'Chennai', state: 'Tamil Nadu', country: 'India' } },
  ]);

  // Create talent profiles
  const future = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const talentProfiles = await TalentProfile.create([
    {
      user_id: talentUsers[0]._id,
      skill_type: ['Singer', 'Musician'],
      bio: 'Professional singer with 10+ years performing at weddings, corporate events, and concerts. Specializing in pop, jazz, and R&B.',
      experience: { years: 10, description: 'Performed at 500+ events across India' },
      hourlyRate: 150,
      location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
      languages: ['Hindi', 'English'],
      tags: ['wedding', 'corporate', 'jazz', 'pop'],
      rating: { average: 4.8, count: 24 },
      portfolio: [
        { title: 'Wedding Performance', description: 'Live music at Mumbai wedding', mediaUrl: 'https://picsum.photos/seed/david1/400/300', mediaType: 'image' },
        { title: 'Corporate Gala', description: 'Annual corporate gala in Pune', mediaUrl: 'https://picsum.photos/seed/david2/400/300', mediaType: 'image' },
      ],
      availability: [
        { date: future(7), startTime: '14:00', endTime: '22:00' },
        { date: future(14), startTime: '10:00', endTime: '18:00' },
        { date: future(21), startTime: '14:00', endTime: '22:00' },
      ],
      contact_info: { website: 'https://davidrivera.music', instagram: '@davidriveramusic' },
      isVerified: true,
    },
    {
      user_id: talentUsers[1]._id,
      skill_type: ['Dancer'],
      bio: 'Contemporary and hip-hop dance instructor and performer. Choreographer for music videos and stage shows.',
      experience: { years: 8, description: 'Trained at Kalakshetra, performed across India' },
      hourlyRate: 120,
      location: { city: 'Delhi', state: 'Delhi', country: 'India' },
      languages: ['Hindi', 'Tamil', 'English'],
      tags: ['contemporary', 'hip-hop', 'choreography', 'stage'],
      rating: { average: 4.9, count: 18 },
      portfolio: [
        { title: 'Music Video', description: 'Lead dancer in chart-topping music video', mediaUrl: 'https://picsum.photos/seed/emma1/400/300', mediaType: 'image' },
      ],
      availability: [
        { date: future(5), startTime: '09:00', endTime: '17:00' },
        { date: future(12), startTime: '13:00', endTime: '21:00' },
      ],
      contact_info: { instagram: '@emmachendance', youtube: 'EmmaChendance' },
      isVerified: true,
    },
    {
      user_id: talentUsers[2]._id,
      skill_type: ['Athlete', 'Fitness Trainer'],
      bio: 'Former NBA player turned fitness coach. Specializes in basketball training, sports motivation talks, and corporate wellness programs.',
      experience: { years: 15, description: 'IPL player turned coach, now coaching youth and corporate clients' },
      hourlyRate: 200,
      location: { city: 'Bangalore', state: 'Karnataka', country: 'India' },
      languages: ['English'],
      tags: ['basketball', 'fitness', 'motivation', 'corporate wellness'],
      rating: { average: 4.7, count: 31 },
      portfolio: [
        { title: 'Youth Camp', description: 'Summer cricket camp for youth', mediaUrl: 'https://picsum.photos/seed/marcus1/400/300', mediaType: 'image' },
      ],
      availability: [
        { date: future(3), startTime: '08:00', endTime: '16:00' },
        { date: future(10), startTime: '08:00', endTime: '16:00' },
      ],
      contact_info: { instagram: '@marcusjfit', website: 'https://marcusjohnson.fit' },
      isVerified: true,
    },
    {
      user_id: talentUsers[3]._id,
      skill_type: ['Photographer', 'Videographer'],
      bio: 'Award-winning photographer specializing in events, portraits, and commercial photography. 8 years of professional experience.',
      experience: { years: 8, description: 'Published in Vogue, Harper\'s Bazaar, and National Geographic' },
      hourlyRate: 180,
      location: { city: 'Hyderabad', state: 'Telangana', country: 'India' },
      languages: ['Telugu', 'Hindi', 'English'],
      tags: ['events', 'portraits', 'commercial', 'wedding photography'],
      rating: { average: 4.6, count: 42 },
      portfolio: [
        { title: 'Fashion Editorial', description: 'Lakme Fashion Week coverage', mediaUrl: 'https://picsum.photos/seed/sofia1/400/300', mediaType: 'image' },
        { title: 'Wedding Gallery', description: 'Destination wedding in Goa', mediaUrl: 'https://picsum.photos/seed/sofia2/400/300', mediaType: 'image' },
      ],
      availability: [
        { date: future(2), startTime: '10:00', endTime: '20:00' },
        { date: future(9), startTime: '10:00', endTime: '20:00' },
        { date: future(16), startTime: '10:00', endTime: '20:00' },
      ],
      contact_info: { website: 'https://sofiapatelphoto.com', instagram: '@sofiapatelphoto' },
      isVerified: false,
    },
    {
      user_id: talentUsers[4]._id,
      skill_type: ['Comedian', 'Speaker'],
      bio: 'Stand-up comedian and keynote speaker. Brings humor and insight to corporate events, conferences, and private parties.',
      experience: { years: 6, description: 'Performed at 200+ corporate events, TEDx India speaker' },
      hourlyRate: 250,
      location: { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      languages: ['English'],
      tags: ['stand-up', 'corporate', 'keynote', 'emcee'],
      rating: { average: 4.5, count: 15 },
      portfolio: [
        { title: 'TEDx Talk', description: 'Jugaad: Finding Humor in Indian Leadership', mediaUrl: 'https://picsum.photos/seed/jake1/400/300', mediaType: 'image' },
      ],
      availability: [
        { date: future(6), startTime: '18:00', endTime: '23:00' },
        { date: future(13), startTime: '18:00', endTime: '23:00' },
      ],
      contact_info: { website: 'https://jakethompsoncomedy.com', instagram: '@jakethompsoncomedy' },
      isVerified: true,
    },
  ]);

  // Create bookings
  const pastDate = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const bookings = await Booking.create([
    {
      user_id: clients[0]._id,
      talent_id: talentProfiles[0]._id,
      event_date: pastDate(30),
      startTime: '18:00', endTime: '22:00',
      eventType: 'Wedding',
      venue: { name: 'Taj Banquet Hall', city: 'Los Angeles' },
      status: 'Completed',
      paymentStatus: 'Paid',
      agreedPrice: 600,
      notes: 'Please include jazz standards',
    },
    {
      user_id: clients[1]._id,
      talent_id: talentProfiles[2]._id,
      event_date: pastDate(15),
      startTime: '09:00', endTime: '12:00',
      eventType: 'Corporate Wellness',
      venue: { name: 'Infosys Campus', city: 'Chicago' },
      status: 'Completed',
      paymentStatus: 'Paid',
      agreedPrice: 600,
    },
    {
      user_id: clients[2]._id,
      talent_id: talentProfiles[1]._id,
      event_date: future(14),
      startTime: '19:00', endTime: '21:00',
      eventType: 'Birthday Party',
      venue: { name: 'The Leela Palace Ballroom', city: 'New York' },
      status: 'Confirmed',
      paymentStatus: 'Partial',
      agreedPrice: 480,
    },
    {
      user_id: clients[0]._id,
      talent_id: talentProfiles[3]._id,
      event_date: future(7),
      startTime: '10:00', endTime: '16:00',
      eventType: 'Product Launch',
      venue: { name: 'Hyderabad International Convention Centre', city: 'Miami' },
      status: 'Pending',
      paymentStatus: 'Unpaid',
      agreedPrice: 1080,
    },
  ]);

  // Create reviews for completed bookings
  await Review.create([
    {
      user_id: clients[0]._id,
      talent_id: talentProfiles[0]._id,
      booking_id: bookings[0]._id,
      rating: 5,
      review_text: 'David was absolutely phenomenal! His voice filled the entire venue and our guests were blown away. Highly recommend for any event!',
    },
    {
      user_id: clients[1]._id,
      talent_id: talentProfiles[2]._id,
      booking_id: bookings[1]._id,
      rating: 5,
      review_text: 'Marcus brought incredible energy to our corporate wellness day. Everyone left motivated and feeling great. Will definitely book again!',
    },
  ]);

  // Update booking with review IDs
  await Booking.findByIdAndUpdate(bookings[0]._id, { reviewId: (await Review.findOne({ booking_id: bookings[0]._id }))._id });

  console.log('✅ Seed complete!');
  console.log('\n📋 Test credentials:');
  console.log('  Admin:    admin@localgems.com / password123');
  console.log('  Client:   priya@example.com / password123');
  console.log('  Talent:   arjun@example.com / password123');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
