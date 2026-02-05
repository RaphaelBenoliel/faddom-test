const express = require('express');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const cpuRoutes = require('./routes/cpu.route');

const app = express();
app.use(cors());
app.use(express.json());

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

app.locals.ec2 = new AWS.EC2();
app.locals.cloudwatch = new AWS.CloudWatch();

app.use('/api', cpuRoutes);

const PORT = 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
