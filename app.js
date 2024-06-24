const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Connect to MongoDB using Mongoose
mongoose.connect('mongodb://localhost:27017/newdata' )
.then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

// Define a Mongoose Schema
const dataSchema = new mongoose.Schema({
    name: String,
    age: Number,
    email: String
});

const Data = mongoose.model('Data', dataSchema);

app.use(express.json());

// Route to handle POST requests to insert data
app.post('/data', async (req, res) => {
    try {
        const newData = new Data(req.body);
        await newData.save();
        res.status(201).json({ message: 'Data inserted successfully', data: newData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error inserting data' });
    }
});

app.post('/data/all', async (req, res) => {
  try {
    // Check if req.body is an array of documents
    if (!Array.isArray(req.body)) {
      throw new Error('Invalid data format. Please provide an array of documents.');
    }

    // Insert multiple documents using insertMany
    const newDatas = await Data.insertMany(req.body);
    res.status(201).json({ message: 'Data inserted successfully', data: newDatas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error inserting data' });
  }
});

app.delete('/data/:field/:value', async (req, res) => {
    const { field, value } = req.params; // Destructuring to get field and value
  
    try {
      const deletedData = await Data.deleteOne({ [field]: value }); // Dynamic field access
      if (deletedData.deletedCount === 0) {
        return res.status(404).json({ message: 'No data found with that criteria' });
      }
      res.status(200).json({ message: 'Data deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error deleting data' });
    }
});

app.patch('/data/update-name', async (req, res) => {
    const { age, newName } = req.body; // Extract age and new name from request body
  
    try {
      const updateResult = await Data.updateOne({ age }, { $set: { name: newName } }); // Update name where age matches
  
      if (updateResult.matchedCount === 0) {
        return res.status(404).json({ message: 'No data found with that age' });
      }
      res.status(200).json({ message: 'Names updated successfully', updatedCount: updateResult.modifiedCount });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error updating data' });
    }
  });

app.put('/data/update/:id', async (req, res) => {
    const { id } = req.params; // Extract document ID from request parameters
    const newData = req.body; // New data for the document
  
    try {
      // Update the document with the new data
      const updatedData = await Data.findByIdAndUpdate(id, newData, { new: true });
      
      if (!updatedData) {
        return res.status(404).json({ message: 'No data found with that ID' });
      }

      res.status(200).json({ message: 'Data updated successfully', data: updatedData });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error updating data' });
    }
});


  
app.get('/data/:field/:value', async (req, res) => {
    const { field, value } = req.params; // Destructuring to get field and value
  
    try {
      const foundData = await Data.find({ [field]: value }); // Dynamic field access
  
      if (!foundData.length) {
        return res.status(404).json({ message: 'No data found with that criteria' });
      }
  
      res.status(200).json({ message: 'Data found successfully', data: foundData });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching data' });
    }
  });

  app.get('/data/all', async (req, res) => {
    try {
      const candidates = await Data.find();
      res.json(candidates);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get('/data/average-age', async (req, res) => {
    try {
        const averageAgeResult = await Data.aggregate([
            {
                $group: {
                    _id: null,
                    averageAge: { $avg: "$age" }
                }
            }
        ]);

        if (!averageAgeResult || averageAgeResult.length === 0) {
            return res.status(404).json({ message: 'No data found' });
        }

        const averageAge = averageAgeResult[0].averageAge;

        res.status(200).json({ message: 'Average age calculated successfully', averageAge });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error calculating average age' });
    }
});
  

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
