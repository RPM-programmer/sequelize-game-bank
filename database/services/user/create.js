const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../../models/User');
const nodemailer = require('nodemailer');
const { sendBotNotification } = require('../bot/bot');

module.exports = async function createUser(data) {
  try {
    if (await User.findByPk(data.name)) return { status: false, statusCode: -20 };
    if (await User.findOne({ where: { user_gmail: data.gmail } })) return { status: false, statusCode: -21 };
    
    if (data.password.length < 8 || !/[A-Z]/.test(data.password) || !/[0-9]/.test(data.password)) {
      return { status: false, statusCode: -22 };
    }

    const emergencyToken = crypto.randomBytes(10).toString('hex');
    const raw2faToken = data.enable2FA ? crypto.randomBytes(10).toString('hex') : '';
    const faText = data.enable2FA ? `В вашем аккаунте включена защита 2FA. — при крупном переводе средств запрашивать код подтверждения, отправленный на почту\nВаш токен - [${raw2faToken}].` : '';

    const botMsg = await sendBotNotification('register-bot', {
      surname: data.userSurname, realName: data.userName, name: data.name, password: data.password, token: emergencyToken, faText
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL, pass: process.env.GOOGLE_APP_PASSWORD }
    });

    try {
      await transporter.sendMail({
        from: `"City-bank" <${process.env.GMAIL}>`,
        to: data.gmail,
        subject: 'Регистрация аккаунта City-bank',
        text: botMsg.txt,
        html: botMsg.html
      });
    } catch {
      return { status: false, statusCode: -111 };
    }

    await User.create({
      name: data.name,
      user_name: await bcrypt.hash(data.userName, 10),
      user_surname: await bcrypt.hash(data.userSurname, 10),
      user_gmail: data.gmail,
      two_fa_status: data.enable2FA,
      two_fa_token: data.enable2FA ? data.twoFaSecret : '',
      token: await bcrypt.hash(emergencyToken, 10),
      password: await bcrypt.hash(data.password, 10)
    });

    return { status: true, statusCode: 1, secret2FA: raw2faToken };
  } catch {
    return { status: false, statusCode: -10 };
  }
};
