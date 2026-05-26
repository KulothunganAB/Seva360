const express = require('express');
const router = express.Router();
const {
  getCampaigns, getCampaignById, createCampaign, updateCampaign,
  participateInCampaign, getDonations, makeDonation, getCharityStats
} = require('../controllers/charityController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

router.get('/campaigns', optionalAuth, getCampaigns);
router.get('/campaigns/stats', getCharityStats);
router.get('/campaigns/:id', optionalAuth, getCampaignById);
router.post('/campaigns', authenticate, authorize('admin'), createCampaign);
router.put('/campaigns/:id', authenticate, authorize('admin'), updateCampaign);
router.post('/campaigns/:id/participate', authenticate, participateInCampaign);

router.get('/donations', authenticate, getDonations);
router.post('/donations', authenticate, makeDonation);

module.exports = router;
