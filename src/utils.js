const { qiwiApi, bot } = require('./api')
const fs = require('fs')
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore')
const { adminGroupId, pollingInterval, timeFormatToAdminChat } = require('./consts')
const dayjs = require('dayjs')
dayjs.extend(isSameOrBefore)

const createBasicBillfields = (amount) => ({
    amount,
    currency: 'RUB',
    comment: `Продажа подписки на неделю. Оплата подписки на ${amount} рублей.`,
    expirationDateTime: qiwiApi.getLifetimeByDay(0.01),
});

const getTelegramId = (ctx) => ctx.update.message.from.id

const notifySupport = async (bot, message) => {
    await bot.telegram.sendMessage(adminGroupId, message, { parse_mode: 'HTML'})
}

const isBotBlocked = (e) => e?.response?.error_code === 403 && e?.response?.description === 'Forbidden: bot was blocked by the user'

const operationResultPoller = async(billId, chatId, subscription, userName) => {

    const checkCondition = async () => {
        try {
            const result = await qiwiApi.getBillInfo(billId)
            if (result.status.value === "WAITING") {
                setTimeout(checkCondition, pollingInterval)
            }
            if (result.status.value === 'PAID') {

                await notifySupport(bot, `Приобретена подписка в чат ${subscription.text}, пользователь ${userName}, ${dayjs().format(timeFormatToAdminChat)}`)
                const link = await bot.telegram.createChatInviteLink(subscription.channelId)

                setTimeout(async () => await bot.telegram.revokeChatInviteLink(subscription.channelId, link.invite_link), 10000)
                await bot.telegram.sendMessage(chatId, `Оплата прошла успешно! Ваша ссылка для вступления в чат: \n ${link.invite_link}`)
            }
            if (result.status.value === 'REJECTED') {

                await bot.telegram.sendMessage(chatId, 'Счет был отклонен, попробуйте снова')
            }
            if (result.status.value === 'EXPIRED') {

                await bot.telegram.sendMessage(chatId, 'Срок оплаты счета истек, если потребуется - создайте новый')
            }
        }  catch (e) {
            console.log(e)
            fs.appendFileSync('./log.txt', JSON.stringify(e))
            if (!isBotBlocked(e)) {
                await bot.telegram.sendMessage(chatId, 'Произошла ошибка, повторите попытку позже или напишите нам')
            }
        }
    }
    checkCondition()
}

const paymentHandler = async (ctx, subscription) => {
    console.log(ctx, 'CTX')
    const telegramId = getTelegramId(ctx)
    const { chat } = ctx
    const name = `${chat.first_name} ${chat.last_name || ''}`.trim()

    const billId = qiwiApi.generateId()
    const billForSubscription = createBasicBillfields(subscription.price, telegramId)
    const paymentDetails = await qiwiApi.createBill(billId, billForSubscription)

    operationResultPoller(billId, ctx.from.id, subscription, name)
    return await ctx.reply(`${name}, это ваша ссылка для оплаты подписки \n${paymentDetails.payUrl}`)
}

module.exports = {
    createBasicBillfields,
    getTelegramId,
    notifySupport,
    isBotBlocked,
    operationResultPoller,
    paymentHandler
}