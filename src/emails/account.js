// 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

const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const welcomeMail = (email,name) => {
  sgMail.send({
    to: email, // Change to your recipient
    from: 'aswaniusha13@gmail.com', // Change to your verified sender
    subject: 'Welcome Mail',
    html: `<h2>Thanks ${name} for using our app</h2>`,
  }).then(() => {
    console.log('Email sent')
  }).catch((error) => {
    console.error(error)
  })
} 

const cancelMail = (email,name) => {
  sgMail.send({
    to: email, // Change to your recipient
    from: 'aswaniusha13@gmail.com', // Change to your verified sender
    subject: 'Welcome Mail',
    html: `<h2>hello ${name}, Can you please tell me the reason why did you delete your account ?</h2>`,
  }).then(() => {
    console.log('Email sent')
  }).catch((error) => {
    console.error(error)
  })
} 

module.exports = {
  welcomeMail,
  cancelMail
}
  