const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

// NEW: Logging middleware for incoming requests
app.use((req, res, next) => {
  console.log('--- Incoming Request ---');
  console.log(req.method, req.url);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  next();
});

// NEW: Middleware to capture and log outgoing response data
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    console.log('--- Outgoing Response ---');
    console.log(data);
    return originalSend.apply(this, arguments);
  };
  next();
});

// NEW: JSON body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// Mock datasets for development
let datasets = [
  {
    id: 1,
    name: 'Sample Dataset',
    rows: 1000,
    columns: 10,
    lastModified: new Date().toISOString(),
    status: 'ready'
  }
];

// Mock connections for development
let connections = [
  {
    id: 1,
    name: 'Local PostgreSQL',
    type: 'postgresql',
    host: 'localhost',
    port: 5432,
    database: 'sample_db',
    username: 'user',
    status: 'connected'
  }
];

// Endpoint for listing datasets
app.get('/api/datasets', (req, res) => {
  res.json(datasets);
});

// Endpoint for listing connections
app.get('/api/connections', (req, res) => {
  res.json(connections);
});

// Endpoint for chat
app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  res.json({
    response: `AI response to: ${message}`,
    timestamp: new Date().toISOString()
  });
});

// Endpoint for data analysis
app.get('/api/data/analyze', (req, res) => {
  res.json({
    rowCount: 1000,
    columnCount: 5,
    memoryUsage: 2048576, // 2MB in bytes
    duplicateRows: 10,
    columns: [
      {
        name: 'id',
        type: 'number',
        stats: {
          count: 1000,
          missing: 0,
          unique: 1000,
          mean: 500.5,
          std: 288.675,
          min: 1,
          max: 1000,
          median: 500,
          mode: null,
          quartiles: [250, 500, 750],
          skewness: 0,
          kurtosis: -1.2,
          distribution: {
            bins: [0, 200, 400, 600, 800, 1000],
            counts: [200, 200, 200, 200, 200]
          }
        }
      },
      {
        name: 'category',
        type: 'string',
        stats: {
          count: 1000,
          missing: 5,
          unique: 4,
          categories: [
            { value: 'A', count: 300, percentage: 30 },
            { value: 'B', count: 250, percentage: 25 },
            { value: 'C', count: 245, percentage: 24.5 },
            { value: 'D', count: 200, percentage: 20 }
          ]
        }
      }
    ]
  });
});

// Endpoint for numeric columns
app.get('/api/datasets/active/numeric-columns', (req, res) => {
  res.json({ 
    numericColumns: [
      { value: 'column1', label: 'Column 1' },
      { value: 'column2', label: 'Column 2' },
      { value: 'column3', label: 'Column 3' }
    ] 
  });
});

// Endpoint for all columns
app.get('/api/datasets/active/columns', (req, res) => {
  res.json({ 
    columns: [
      { value: 'column1', label: 'Column 1', type: 'numeric' },
      { value: 'column2', label: 'Column 2', type: 'numeric' },
      { value: 'column3', label: 'Column 3', type: 'categorical' },
      { value: 'column4', label: 'Column 4', type: 'datetime' }
    ] 
  });
});

// Endpoint for dataset preview
app.get('/api/datasets/active/preview', (req, res) => {
  res.json({
    columns: [
      { name: 'id', type: 'number', missing: 0, unique: 1000, sample: [1, 2, 3] },
      { name: 'name', type: 'string', missing: 5, unique: 950, sample: ['A', 'B', 'C'] },
      { name: 'value', type: 'number', missing: 10, unique: 100, sample: [10.5, 20.3, 15.7] }
    ],
    data: [
      { id: 1, name: 'Sample A', value: 10.5 },
      { id: 2, name: 'Sample B', value: 20.3 },
      { id: 3, name: 'Sample C', value: 15.7 }
    ],
    totalRows: 1000
  });
});

// Replace the existing /api/kaggle/search endpoint with live integration
app.get('/api/kaggle/search', async (req, res) => {
  const queryParam = req.query.query || '';
  try {
    // Import the live Kaggle search function from the DW_app/modules directory
    const { searchKaggleDatasets } = require('../DW_app/modules/kaggleUtils');
    const result = await searchKaggleDatasets(queryParam);
    return res.json(result);
  } catch (error) {
    console.error('Live Kaggle search error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Replace the existing /api/datasets/upload endpoint with live integration
app.post('/api/datasets/upload', async (req, res) => {
  try {
    // Import the live dataset upload function from the DW_app/modules directory
    const { uploadDataset } = require('../DW_app/modules/datasetUpload');
    const result = await uploadDataset(req);
    return res.json(result);
  } catch (error) {
    console.error('Live dataset upload error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Replace the existing /api/data/classify endpoint with live integration
app.post('/api/data/classify', async (req, res) => {
  try {
    // Import the live classification function from the DW_app/modules directory
    const { trainClassificationModel } = require('../DW_app/modules/classificationService');
    const result = await trainClassificationModel(req.body);
    return res.json(result);
  } catch (error) {
    console.error('Live classification error:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend API server is running on http://localhost:${port}`);
}); 