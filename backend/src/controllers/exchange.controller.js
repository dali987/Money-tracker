import mongoose from 'mongoose';
import pkg from 'country-list-with-dial-code-and-flag';
const countryList = pkg.default;
import ExchangeRates from '../models/exchangeRates.model.js';
import { ENV } from '../lib/env.js';

export const fetchAndSaveExchangeRates = async () => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const result = await fetch(
            `https://v6.exchangerate-api.com/v6/${ENV.EXCHANGE_RATE_API_KEY}/latest/USD`,
        );
        if (!result.ok) {
            const error = new Error("Couldn't update exchange rates");
            error.status = 500;
            throw error;
        }

        const exchangeRates = await result.json();

        if (!exchangeRates) {
            const error = new Error('Failed to update exchange rates');
            error.status = 500;
            throw error;
        }

        const updatedExchangeRates = await ExchangeRates.findOneAndUpdate(
            {},
            {
                timeLastUpdateUnix: exchangeRates.time_last_update_unix,
                timeLastUpdateUtc: exchangeRates.time_last_update_utc,
                timeNextUpdateUnix: exchangeRates.time_next_update_unix,
                timeNextUpdateUtc: exchangeRates.time_next_update_utc,
                base: exchangeRates.base_code,
                rates: exchangeRates.conversion_rates,
                lastFetchedAt: new Date(),
            },
            { upsert: true, new: true, session },
        );

        if (!updatedExchangeRates) {
            const error = new Error('Failed to update exchange rates');
            error.status = 500;
            throw error;
        }

        await session.commitTransaction();
        return updatedExchangeRates;
    } catch (error) {
        console.error('An error occurred while fetching and saving exchange rates: ', error);
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

export const getRates = async () => {
    try {
        const rates = await ExchangeRates.findOne();
        if (!rates) {
            return await fetchAndSaveExchangeRates();
        }

        const oneDayInMs = 24 * 60 * 60 * 1000;
        const lastFetched = rates.lastFetchedAt ? new Date(rates.lastFetchedAt).getTime() : 0;
        const now = Date.now();

        if (!rates.lastFetchedAt) {
            const oneDayInSeconds = 24 * 60 * 60;
            const nowUnix = Math.floor(Date.now() / 1000);
            if (nowUnix - rates.timeLastUpdateUnix > oneDayInSeconds) {
                return await fetchAndSaveExchangeRates();
            }
        } else if (now - lastFetched > oneDayInMs) {
            return await fetchAndSaveExchangeRates();
        }

        return rates;
    } catch (error) {
        console.error('Error checking/updating exchange rates:', error);
        throw error;
    }
};

export const updateExchangeRates = async (req, res, next) => {
    try {
        const updatedExchangeRates = await fetchAndSaveExchangeRates();
        res.status(200).json({ success: true, data: updatedExchangeRates });
    } catch (error) {
        console.error('An error occurred while updating exchange rates: ', error);
        next(error);
    }
};

export const getExchangeRates = async (req, res, next) => {
    try {
        const exchangeRates = await getRates();
        if (!exchangeRates) {
            const error = new Error('Exchange rates not found');
            error.status = 404;
            throw error;
        }

        res.status(200).json({ success: true, data: exchangeRates });
        return exchangeRates;
    } catch (error) {
        console.error('An error occurred while getting exchange rates: ', error);
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

        if (from === to) {
            res.status(200).json({ success: true, data: amount });
            return;
        }

        const exchangeRates = await getRates();

        const { rates } = exchangeRates;

        const fromRate = rates.get(from.toUpperCase());
        const toRate = rates.get(to.toUpperCase());

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
        const exchangeRates = await getRates();

        if (!exchangeRates) {
            const error = new Error('Exchange rates not found');
            error.status = 404;
            throw error;
        }

        const { rates } = exchangeRates;

        const currencies = [...rates.keys()];

        const currencyMap = {};
        currencies.forEach((currency) => {
            const country = countryList.findOneByCurrencyCode(currency);
            if (country) {
                currencyMap[currency] = country.data;
            }
        });

        res.status(200).json({ success: true, data: currencyMap });
    } catch (error) {
        console.error('An error occurred while getting currencies: ', error);
        next(error);
    }
};
