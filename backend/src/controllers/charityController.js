const { charityRequestsDb, donationsDb, notificationsDb } = require('../database/db');
const { create, getById, getAll, update, remove } = require('../utils/crud');
const response = require('../utils/response');
const { v4: uuidv4 } = require('uuid');

/**
 * GET /api/charity/campaigns
 */
const getCampaigns = (req, res) => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;
    let campaigns = getAll(charityRequestsDb, 'charityRequests');
    
    if (type) campaigns = campaigns.filter(c => c.type === type);
    if (status) campaigns = campaigns.filter(c => c.status === status);
    
    campaigns = campaigns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const total = campaigns.length;
    const offset = (page - 1) * limit;
    const data = campaigns.slice(offset, Number(offset) + Number(limit));
    
    return response.paginated(res, { data, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    return response.error(res, 'Failed to fetch campaigns');
  }
};

/**
 * GET /api/charity/campaigns/:id
 */
const getCampaignById = (req, res) => {
  try {
    const campaign = getById(charityRequestsDb, 'charityRequests', req.params.id);
    if (!campaign) return response.notFound(res, 'Campaign not found');
    return response.success(res, campaign);
  } catch (err) {
    return response.error(res, 'Failed to fetch campaign');
  }
};

/**
 * POST /api/charity/campaigns
 */
const createCampaign = (req, res) => {
  try {
    const {
      title, description, type, targetAmount,
      beneficiary, district, urgency, images = []
    } = req.body;
    
    if (!title || !type) {
      return response.badRequest(res, 'Title and type are required');
    }
    
    const campaign = create(charityRequestsDb, 'charityRequests', {
      title,
      description: description || '',
      type, // blood-donation, medical-camp, food-distribution, scholarship, disaster-relief, welfare
      targetAmount: Number(targetAmount) || 0,
      collectedAmount: 0,
      beneficiary: beneficiary || '',
      district: district || 'Chennai',
      urgency: urgency || 'normal',
      status: 'active',
      images,
      participants: [],
      donors: [],
      createdBy: req.user.id,
      createdByName: req.user.name,
      approvedBy: req.user.role === 'admin' ? req.user.id : null,
    });
    
    // Broadcast new campaign
    const io = req.app.get('io');
    if (io) {
      io.emit('newCampaign', { campaignId: campaign.id, title, type, urgency });
    }
    
    return response.created(res, campaign, 'Campaign created');
  } catch (err) {
    return response.error(res, 'Failed to create campaign');
  }
};

/**
 * PUT /api/charity/campaigns/:id
 */
const updateCampaign = (req, res) => {
  try {
    const campaign = getById(charityRequestsDb, 'charityRequests', req.params.id);
    if (!campaign) return response.notFound(res, 'Campaign not found');
    
    const updated = update(charityRequestsDb, 'charityRequests', req.params.id, req.body);
    return response.success(res, updated, 'Campaign updated');
  } catch (err) {
    return response.error(res, 'Failed to update campaign');
  }
};

/**
 * POST /api/charity/campaigns/:id/participate
 */
const participateInCampaign = (req, res) => {
  try {
    const campaign = getById(charityRequestsDb, 'charityRequests', req.params.id);
    if (!campaign) return response.notFound(res, 'Campaign not found');
    
    const participants = campaign.participants || [];
    if (participants.find(p => p.userId === req.user.id)) {
      return response.conflict(res, 'Already participating');
    }
    
    const participant = {
      userId: req.user.id,
      name: req.user.name,
      role: req.user.role,
      joinedAt: new Date().toISOString(),
    };
    
    const updated = update(charityRequestsDb, 'charityRequests', req.params.id, {
      participants: [...participants, participant],
    });
    
    return response.success(res, updated, 'Joined campaign');
  } catch (err) {
    return response.error(res, 'Failed to participate');
  }
};

/**
 * GET /api/charity/donations
 */
const getDonations = (req, res) => {
  try {
    const { campaignId, page = 1, limit = 10 } = req.query;
    let donations = getAll(donationsDb, 'donations');
    
    if (campaignId) donations = donations.filter(d => d.campaignId === campaignId);
    
    // Citizens see only their own
    if (req.user.role === 'citizen') {
      donations = donations.filter(d => d.donorId === req.user.id);
    }
    
    donations = donations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const total = donations.length;
    const offset = (page - 1) * limit;
    const data = donations.slice(offset, Number(offset) + Number(limit));
    
    return response.paginated(res, { data, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    return response.error(res, 'Failed to fetch donations');
  }
};

/**
 * POST /api/charity/donations
 */
const makeDonation = (req, res) => {
  try {
    const { campaignId, amount, paymentMethod, message } = req.body;
    
    if (!campaignId || !amount) {
      return response.badRequest(res, 'Campaign and amount are required');
    }
    
    const campaign = getById(charityRequestsDb, 'charityRequests', campaignId);
    if (!campaign) return response.notFound(res, 'Campaign not found');
    
    const donation = create(donationsDb, 'donations', {
      campaignId,
      campaignTitle: campaign.title,
      amount: Number(amount),
      donorId: req.user.id,
      donorName: req.user.name,
      paymentMethod: paymentMethod || 'online',
      message: message || '',
      status: 'completed',
      receiptNumber: `RCP-${Date.now()}`,
    });
    
    // Update campaign collected amount
    update(charityRequestsDb, 'charityRequests', campaignId, {
      collectedAmount: (campaign.collectedAmount || 0) + Number(amount),
      donors: [...(campaign.donors || []), { donorId: req.user.id, name: req.user.name, amount: Number(amount) }],
    });
    
    return response.created(res, donation, 'Donation recorded');
  } catch (err) {
    return response.error(res, 'Failed to record donation');
  }
};

/**
 * GET /api/charity/stats
 */
const getCharityStats = (req, res) => {
  try {
    const campaigns = getAll(charityRequestsDb, 'charityRequests');
    const donations = getAll(donationsDb, 'donations');
    
    const totalDonations = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const totalBeneficiaries = campaigns.reduce((sum, c) => sum + (c.participants?.length || 0), 0);
    
    const byType = campaigns.reduce((acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + 1;
      return acc;
    }, {});
    
    return response.success(res, {
      totalCampaigns: campaigns.length,
      activeCampaigns,
      totalDonations,
      totalBeneficiaries,
      byType,
    });
  } catch (err) {
    return response.error(res, 'Failed to fetch charity stats');
  }
};

module.exports = {
  getCampaigns, getCampaignById, createCampaign, updateCampaign,
  participateInCampaign, getDonations, makeDonation, getCharityStats,
};
