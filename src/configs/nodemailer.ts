import nodemailer from 'nodemailer'
import { env } from './env.js'

const emailTransporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
       user: env.EMAIL_ADDRESS,
       pass: env.GOOGLE_APP_PASSWORD
    }
})

export default emailTransporter