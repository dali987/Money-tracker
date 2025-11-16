import mongoose from "mongoose"

const exchangeRatesSchema = new mongoose.Schema({
    timeLastUpdateUnix: {
        type: Number,
        required: true,
    },
    timeLastUpdateUtc: {
        type: String,
        required: true,
    },
    timeNextUpdateUnix: {
        type: Number,
        required: true,
    },
    timeNextUpdateUtc: {
        type: String,
        required: true,
    },
    base: {
        type: String,
        required: true,
    },
    rates: {
        type: Map,
        of: Number,
        required: true
    }
})

const ExchangeRates = mongoose.model("ExchangeRates", exchangeRatesSchema)

export default ExchangeRates