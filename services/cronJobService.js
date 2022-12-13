const nodemailer = require('nodemailer')
const nodeCron = require('node-cron')

nodeCron.schedule('1 * * * *', function () {
    mailService()
})

const mailService = async () => {
    const transporter = nodemailer.createTransport({
        port: 465,
        host: 'smtp.gmail.com',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
        secure: true, // upgrades later with STARTTLS -- change this based on the PORT
    })

    // setting credentials
    let mailDetails = {
        // from: 'cronjob@gmail.com',
        to: 'hieuden0@gmail.com',
        subject: 'Test Mail using Cron Job',
        text: 'Node.js Cron Job Email Demo Test from Reflectoring Blog',
    }

    // sending email
    transporter.sendMail(mailDetails, function (err, data) {
        if (err) {
            console.log('error occurred', err.message)
        } else {
            console.log('---------------------')
            console.log('email sent successfully')
        }
    })
}

const startCronJob = async (cronjob) => {    
    nodeCron.schedule(cronjob, function () {
        mailService()
        console.log('---------------------')
        console.log(`start cronjob at ${cronjob}`)
    })
}


module.exports = {
    mailService,
    startCronJob
}
