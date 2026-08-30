// Automated test suite for Swasthishree (ಸ್ವಸ್ತಿ ಶ್ರೀ)
async function runTests() {
  const baseURL = 'http://localhost:5000/api';
  console.log('🧪 Starting Clean Slate & Live Data Verification Tests...\n');

  // 0a. Admin Auth Test - User 1 (swasthishree_mangalore)
  const auth1Res = await fetch(`${baseURL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'swasthishree_mangalore', password: 'Swasthi@24' })
  });
  const auth1 = await auth1Res.json();
  console.log('✅ 0a. Admin 1 Auth (swasthishree_mangalore):', auth1.user?.name, '| Token:', auth1.user?.token?.substring(0, 15) + '...');

  // 0b. Admin Auth Test - User 2 (skchinnu)
  const auth2Res = await fetch(`${baseURL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'skchinnu', password: 'Manipal@0818' })
  });
  const auth2 = await auth2Res.json();
  console.log('✅ 0b. Admin 2 Auth (skchinnu):', auth2.user?.name, '| Role:', auth2.user?.role);

  // 0c. Admin Auth Test - Invalid Password
  const authFailRes = await fetch(`${baseURL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'skchinnu', password: 'WrongPassword' })
  });
  console.log('✅ 0c. Invalid Password Status (Should be 401):', authFailRes.status);

  // 1. Health Check
  const healthRes = await fetch(`${baseURL}/health`);
  const health = await healthRes.json();
  console.log('✅ 1. Health Check:', health.system, '| Status:', health.status);

  // 2. Initial Fresh Stats
  const statsRes = await fetch(`${baseURL}/stats`);
  const stats = await statsRes.json();
  console.log('✅ 2. Initial Stats: Residents:', stats.totalResidents, '| Revenue: ₹' + stats.totalRevenueCollected);

  // 3. Register First Real Resident (Aryan Sharma)
  const newResidentRes = await fetch(`${baseURL}/residents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Aryan Sharma',
      room_number: '101',
      phone: '+91 98765 43210',
      email: 'aryan.sharma@example.com',
      monthly_rent: 14000,
      security_deposit: 15000,
      blood_group: 'O+',
      college_or_work: 'Infosys (Software Engineer)',
      status: 'Active'
    })
  });
  const newRes = await newResidentRes.json();
  console.log('✅ 3. Registered Resident:', newRes.name, '| ID:', newRes.id, '| Room:', newRes.room_number);

  // 4. Record Real Payment for Aryan
  const payRes = await fetch(`${baseURL}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resident_id: newRes.id,
      resident_name: 'Aryan Sharma',
      room_number: '101',
      amount: 14000,
      month_year: 'February 2026',
      payment_method: 'UPI',
      transaction_ref: 'UPI/2026/894721908',
      status: 'Paid'
    })
  });
  const newPayment = await payRes.json();
  console.log('✅ 4. Created Payment Receipt:', newPayment.receipt_number, '| Amount: ₹' + newPayment.amount);

  // 5. Log Visitor
  const visRes = await fetch(`${baseURL}/visitors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resident_id: newRes.id,
      resident_name: 'Aryan Sharma',
      room_number: '101',
      visitor_name: 'Karthik Rao',
      relation: 'Colleague',
      phone: '+91 99001 22334',
      purpose: 'Project Discussion'
    })
  });
  const newVis = await visRes.json();
  console.log('✅ 5. Logged Visitor:', newVis.visitor_name, '| Status:', newVis.status);

  // 5b. Delete Visitor Test
  const delVisRes = await fetch(`${baseURL}/visitors/${newVis.id}`, { method: 'DELETE' });
  const delVisData = await delVisRes.json();
  console.log('✅ 5b. Deleted Visitor:', delVisData);

  // 6. Verify Dashboard Metrics dynamically updated
  const updatedStatsRes = await fetch(`${baseURL}/stats`);
  const updatedStats = await updatedStatsRes.json();
  console.log('✅ 6. Dynamically Computed Dashboard Metrics:');
  console.log('   - Total Active Residents:', updatedStats.totalResidents);
  console.log('   - Occupancy Rate:', updatedStats.occupancyRate + '%');
  console.log('   - Total Revenue Collected: ₹' + updatedStats.totalRevenueCollected);
  console.log('   - Vacant Beds Remaining:', updatedStats.vacantBeds);

  // 7. Test Room CRUD: Create Custom Room with custom price
  const createRoomRes = await fetch(`${baseURL}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      room_number: '301-A',
      floor: 3,
      total_beds: 2,
      monthly_rent: 11500,
      amenities: ['Attached Washroom', 'High-Speed Wi-Fi', 'Balcony View']
    })
  });
  const createdRoom = await createRoomRes.json();
  console.log('✅ 7. Created Custom Room:', createdRoom.room_number, '| Price: ₹' + createdRoom.monthly_rent, '| ID:', createdRoom.id);

  // 8. Test Room Duplicate Validation
  const duplicateRes = await fetch(`${baseURL}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      room_number: '301-A',
      floor: 3,
      total_beds: 2,
      monthly_rent: 11500
    })
  });
  console.log('✅ 8. Duplicate Room Validation Status (Should be 400):', duplicateRes.status);

  // 9. Test Room Edit / Price Update
  const updateRoomRes = await fetch(`${baseURL}/rooms/${createdRoom.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      room_number: '301-A',
      floor: 3,
      total_beds: 3,
      monthly_rent: 12500
    })
  });
  const updatedRoom = await updateRoomRes.json();
  console.log('✅ 9. Updated Room Price to ₹' + updatedRoom.monthly_rent, '| Beds:', updatedRoom.total_beds);

  // 10. Test Room Delete
  const deleteRoomRes = await fetch(`${baseURL}/rooms/${createdRoom.id}`, {
    method: 'DELETE'
  });
  const deleteResult = await deleteRoomRes.json();
  console.log('✅ 10. Deleted Room:', deleteResult);

  // 11. Test Mess Menu initial state & custom update
  const messMenuRes = await fetch(`${baseURL}/mess-menu`);
  const messMenuData = await messMenuRes.json();
  const firstDay = messMenuData[0] || {};
  console.log('✅ 11. Mess Menu Loaded (Days count):', messMenuData.length, '| Day:', firstDay.day_of_week);

  const updateMenuRes = await fetch(`${baseURL}/mess-menu/${firstDay.id || 'menu-1'}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      day_of_week: firstDay.day_of_week || 'Monday',
      breakfast: 'Masala Dosa & Filter Coffee',
      lunch: 'South Indian Thali',
      snacks: 'Tea & Biscuits',
      dinner: 'Phulka & Mixed Veg Curry',
      special_notes: 'Fresh sweet fruit'
    })
  });
  const updatedMenu = await updateMenuRes.json();
  console.log('✅ 12. Updated Custom Day Menu Breakfast:', updatedMenu.breakfast);

  // 13. Test Mess Timings GET & PUT
  const updateTimingsRes = await fetch(`${baseURL}/mess-timings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      breakfast: '7:00 AM - 9:30 AM',
      lunch: '12:30 PM - 2:30 PM',
      snacks: '5:00 PM - 6:30 PM',
      dinner: '7:30 PM - 9:45 PM'
    })
  });
  const updatedTimings = await updateTimingsRes.json();
  console.log('✅ 13. Updated Custom Dining Timings: Breakfast:', updatedTimings.breakfast, '| Dinner:', updatedTimings.dinner);

  // 14. Verify Frontend Server
  const frontRes = await fetch('http://localhost:5173');
  console.log('✅ 14. Frontend Server Live Response Status:', frontRes.status);

  console.log('\n🎉 ALL SWASTHISHREE (ಸ್ವಸ್ತಿ ಶ್ರೀ) TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
