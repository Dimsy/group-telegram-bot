const QiwiBillPaymentsAPI = require('@qiwi/bill-payments-node-js-sdk');
const { Telegraf } = require('telegraf');
require('dotenv').config();

const qiwiApi = new QiwiBillPaymentsAPI(process.env.QIWI_SECRET_KEY_DIMA);
const bot = new Telegraf(process.env.TELEGRAM_TOKEN)

module.exports = {
    qiwiApi,
    bot,
}
