// src/index.ts
import express from 'express';
import cors from 'cors';
import { handleOrderRequest } from './orderHandler';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/order', handleOrderRequest);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
