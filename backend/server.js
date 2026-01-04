const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Database Connected"))
  .catch(err => console.error(err));


const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  room: { type: String, required: true },
  phone: { type: String, required: true },
  photo: String, 
});
const Student = mongoose.model('Student', studentSchema);


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });


app.get('/api/students', async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

app.post('/api/students', upload.single('photo'), async (req, res) => {
  try {
    const { name, room, phone } = req.body;
    
    console.log("File received:", req.file); 
    
    const newEntry = new Student({
      name, room, phone,
      photo: req.file ? req.file.path.replace(/\\/g, "/") : "" 
    });

    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (err) {
    console.error("FULL ERROR DETAILS:", err); 
    res.status(400).json({ error: err.message });
  }
});
app.delete('/api/students/:id', async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ message: "Resident Removed" });
});

app.listen(5000, () => console.log(`🚀 Server on http://localhost:5000`));