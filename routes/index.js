import express from 'express';
import authRoutes from './authRoutes.js';
import matchRoutes from './matchRoutes.js';
import newsRoutes from './newsRoutes.js';
import validationRoutes from './validationRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);

router.use('/api', matchRoutes);
router.use('/api', newsRoutes);
router.use('/api', validationRoutes);


export default router;