const basicKeyboard = [['Выбрать чат'], ['FAQ', 'Контакты']]

const adminGroupId = "-752254847"

const chats = {
    "Первый чат": {
        text: 'Первый чат', price: 1, channelId: '-751352337'
    },
    "Второй чат": {
        text: 'Второй чат', price: 1, channelId: '-608267661'
    },
}

const payText = /^Оплатить подписку на/i
const telegramIdRegexp = /\d{7,12}/i

const timeFormatToAdminChat = 'DD.MM.YY HH:mm'
const pollingInterval = 10000;

const startInfoMessage = "<b>Добрый день, я бот, рад приветствовать тебя.</b>\n\n" +
    "Здесь ты можешь приобрести подписку на мой сервис.\n" +
    "Чтобы вызвать клавиатуру для взаимодействия со мной - напиши команду /keyboard.\n" +
    "Основные разделы:\n- <b>«Выбрать чат»</b> - приведет тебя к выбору чата и дальнейшей оплате\n" +
    "- <b>«FAQ»</b> - расскажет основные моменты\n" +
    "- <b>«Контакты»</b> - если возникнут какие-нибудь вопросы или проблемы - здесь ты найдешь наши контакты.\n\n" +
    "На этом все, приятного пользования сервисом!."


module.exports = {
    basicKeyboard, payText, telegramIdRegexp, adminGroupId, startInfoMessage, chats, pollingInterval, timeFormatToAdminChat
}