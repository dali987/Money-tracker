import CountryList from 'country-list-with-dial-code-and-flag';
import ExchangeRates from '../models/exchangeRates.model.js';
import { ENV } from '../lib/env.js';

export const updateExchangeRates = async (req, res, next) => {
    try {
        const result = await fetch(
            `https://v6.exchangerate-api.com/v6/${ENV.EXCHANGE_RATE_API_KEY}/latest/USD`
        );
        if (!result.ok) {
            const error = new Error("Couldn't update exchange rates");
            error.status = 404;
            throw error;
        }

        const exchangeRates = await result.json();

        const updatedExchangeRates = await ExchangeRates.findOneAndUpdate(
            {},
            {
                timeLastUpdateUnix: exchangeRates.time_last_update_unix,
                timeLastUpdateUtc: exchangeRates.time_last_update_utc,
                timeNextUpdateUnix: exchangeRates.time_next_update_unix,
                timeNextUpdateUtc: exchangeRates.time_next_update_utc,
                base: exchangeRates.base_code,
                rates: exchangeRates.conversion_rates,
            },
            { upsert: true, new: true }
        );

        if (!updatedExchangeRates) {
            const error = new Error('Failed to update exchange rates');
            error.status = 500;
            throw error;
        }

        res.status(200).json({ success: true, data: updatedExchangeRates });
        
    } catch (error) {
        console.error(
            'An error occurred while updating exchange rates: ',
            error
        );
        next(error);
    }
};

export const getExchangeRates = async (req, res, next) => {
    try {
        const exchangeRates = await ExchangeRates.find();
        if (!exchangeRates) {
            const error = new Error('Exchange rates not found');
            error.status = 404;
            throw error;
        }

        res.status(200).json({ success: true, data: exchangeRates[0] });
        return exchangeRates[0];
    } catch (error){
        console.error(
            'An error occurred while getting exchange rates: ',
            error
        );
        next(error);
    }
};

export const convertCurrency = async (req, res, next) => {
    try {
        const { from, to, amount } = req.query;

        if (!from || !to || !amount) {
            const error = new Error('missing inputs');
            error.status = 400;
            throw error;
        }

        const exchangeRates = await getExchangeRates();

        const { rates } = exchangeRates;

        const fromRate = rates[from.toUpperCase()];
        const toRate = rates[to.toUpperCase()];

        if (!fromRate || !toRate) {
            const error = new Error('Invalid currency codes');
            error.status = 400;
            throw error;
        }

        const result = (amount / fromRate) * toRate;

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('An error occurred while converting currency: ', error);
        next(error);
    }
};

export const getAllCurrencies = async (req, res, next) => {
    try {
        const exchangeRates = await getExchangeRates();

        const { rates } = exchangeRates;

        const currencies = Object.keys(rates);

        const currencyMap = {};
        currencies.forEach((currency) => {
            currencyMap[currency] = CountryList.findOneByCurrencyCode(currency);
        });

        res.status(200).json({ success: true, data: currencyMap });
    } catch (error) {
        console.error('An error occurred while getting currencies: ', error);
        next(error);
    }
};
