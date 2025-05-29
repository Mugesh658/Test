const express = require('express');
const router = express.Router();
const { Web3 } = require('web3');
const Wallet = require('../models/Wallet');

// Initialize Web3 with the provided Ethereum RPC URL
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL));

/**
 * @route   POST /wallet
 * @desc    Fetch wallet balance from chain and save to DB
 * @body    { address: string }
 */
router.post('/', async (req, res) => {
    try {
        const { address } = req.body;

        if (!web3.utils.isAddress(address)) {
            return res.status(400).json({ error: 'Invalid wallet address' });
        }

        // Get balance in Wei, convert to ETH
        const balanceInWei = await web3.eth.getBalance(address);
        const balanceInEth = web3.utils.fromWei(balanceInWei, 'ether');

        // Save or update in DB
        const wallet = await Wallet.findOneAndUpdate(
            { address },
            {
                address,
                balance: balanceInEth,
                timestamp: new Date()
            },
            { new: true, upsert: true }
        );

        return res.json(wallet);
    } catch (err) {
        console.error('Error saving wallet balance:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @route   GET /wallet/:address
 * @desc    Get saved balance from DB
 */
router.get('/:address', async (req, res) => {
    try {
        const { address } = req.params;

        if (!web3.utils.isAddress(address)) {
            return res.status(400).json({ error: 'Invalid wallet address' });
        }

        const wallet = await Wallet.findOne({ address });
        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        return res.json(wallet);
    } catch (err) {
        console.error('Error retrieving wallet:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
