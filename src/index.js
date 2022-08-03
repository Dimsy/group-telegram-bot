const { Markup, Telegraf } = require('telegraf');
const { bot } = require('./api')
const fs = require('fs')
const { basicKeyboard, chats, payText,} = require('./consts')
const { paymentHandler } = require('./utils')
const { startInfoMessage } = require("./consts");

bot.use(Telegraf.log())
console.log('test');

bot.start(async (ctx) => {

    const isPrivateChat = ctx.message.chat.type === 'private'
    try {
        if (isPrivateChat) {
            await ctx.telegram.setMyCommands([{command: '/keyboard', description: 'Вызов клавиатуры бота'}], {scope: {type: 'default' }})
        } else {
            await ctx.telegram.setMyCommands(
                [],
                {scope: {type: 'all_chat_administrators'}}
            )
        }

        await bot.telegram.sendPhoto(
            ctx.from.id,
            'AgACAgIAAxkBAAIDWGLmk1WZ3T146kFurg8Zu5t1_yG0AAJTvDEbU-0wSw4ZkyTXf0yNAQADAgADeQADKQQ',
            {parse_mode: 'HTML', caption: startInfoMessage}
        )

        return await ctx.reply("Плати бабос и получай доступ в группу")
    } catch (e) {
        return await ctx.reply("Произошла ошибка, попробуйте позднее")
    }
})

bot.use(async(ctx, next) => {

    const messageText = ctx.update.message?.text
    if (Object.keys(chats).includes(messageText)) {
        await bot.telegram.sendMessage(ctx.from.id,`Неделя подписки на <b>${messageText}</b> стоит <b>${chats[messageText].price} рублей</b>, нажми оплатить, чтобы получить ссылку для оплаты`, { parse_mode: 'HTML'})
        return await ctx.reply('Выберите опцию', Markup
        .keyboard([[`Оплатить подписку на ${chats[messageText].text}`, 'Обратно к выбору подписки']])
        .oneTime()
        .resize()
    )}

    if (payText.test(messageText)) {
        const text = messageText.replace(payText, '').trimLeft()
        const subscription = chats[text]
        try {
            await paymentHandler(ctx, subscription)
        } catch (e) {
            console.log(e)
            fs.appendFileSync('./log.txt', JSON.stringify(e))
            return await ctx.reply('Произошла ошибка, попробуйте позже')
        }
    }

    await next()
})

//-------------- COMMANDS BLOCK -------------- //

bot.command('keyboard', async (ctx) => {
    return await ctx.reply('Выберите опцию', Markup
        .keyboard(basicKeyboard)
        .oneTime()
        .resize()
    )
})

//-------------- COMMANDS BLOCK -------------- //

//-------------- NAVIGATION BLOCK -------------- //

bot.hears(['Выбрать чат', 'Обратно к выбору подписки'], async (ctx) => {
    return await ctx.reply('Выберите опцию', Markup
         .keyboard([Object.keys(chats), ['В главное меню']])
         .oneTime()
         .resize()
    )
})


bot.hears('В главное меню', async (ctx) => {
    return await ctx.reply('Выберите опцию', Markup
        .keyboard(basicKeyboard)
        .oneTime()
        .resize()
    )
})

//-------------- NAVIGATION BLOCK -------------- //

//-------------- FAQ BLOCK -------------- //

bot.hears('FAQ', async (ctx) => {
    return await ctx.reply("Здесь будет что то полезное но пока непонятно что", Markup
        .keyboard(['В главное меню'])
        .oneTime()
        .resize()
    )
})

//-------------- FAQ BLOCK -------------- //


//-------------- CONTACTS BLOCK -------------- //
bot.hears('Контакты', async (ctx) => {
    return await ctx.reply('Сюда добавляем контакты куда стучаться если что то не так', Markup
        .keyboard(['В главное меню'])
        .oneTime()
        .resize()
    )
})
//-------------- CONTACTS BLOCK -------------- //


bot.launch()
