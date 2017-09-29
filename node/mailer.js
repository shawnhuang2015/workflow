const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');

let account = {
  host: 'email-smtp.us-east-1.amazonaws.com',
  user: 'AKIAJWNZZR64YADCWJJA',
  pass: 'Aut3OO6t91iEZ7pchNtMgJqV+49gNbX2df5hUXCLxE4A'
}
// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing
// nodemailer.createTestAccount((err, account) => {

// EMAIL_HOST="email-smtp.us-east-1.amazonaws.com"
// EMAIL_USERNAME="AKIAJWNZZR64YADCWJJA"
// EMAIL_PASSWORD="Aut3OO6t91iEZ7pchNtMgJqV+49gNbX2df5hUXCLxE4A"
// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
  host: account.host,
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: account.user, // generated ethereal user
    pass: account.pass  // generated ethereal password
  }
});

for (var i = 0; i < 1; ++i) {
  // setup email data with unicode symbols
  let mailOptions = {
    from: 'TigerGraph GraphStudio <noreply@tigergraph.com>', // sender address
    to: 'shawn.huang@tigergraph.com, shawn.huang@graphsql.com', // list of receivers
    subject: `${i} Hello ✔ ${i}`, // Subject line
    // text: 'Hello world 1!@#!@#!@  ?', // plain text body
    // html: '<b>Hello world !@#!@#!@#!@#?</b>', // html body
    viewEngine: {
      extname: '.hbs',
      layoutsDir: '../views/email/layout',
      defaultLayout: 'template',
      partialsDir: '../views/partials/',
    },
    viewPath: '../views/email/',
    extName: '.hbs',
    context: {
      billingInfo: 'transaction.billingInfo',
      createdAt: 'moment(transaction.createdAt).format(MMMM Do, YYYY)',
      solutionUsages: [
        {
          displayName: 'solutionUsage.data.displayName',
          displayAmmount: 'solutionUsage.Usages[0].Usage.toFixed(2)',
        }
      ],
      subTotal: 'transaction.subTotal.toFixed(2)',
      credits: 'transaction.creditsUsed.toFixed(2)',
      total: 'transaction.displayAmount',
      email: 'user.email',
      webDomain: 'http://testdrive.tigergraph.com'
    },
    template: 'invoice',
  };

  transporter.use('compile', hbs(mailOptions));

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  });
}

// });