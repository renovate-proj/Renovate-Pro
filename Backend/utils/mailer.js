import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
    service: 'gmail', // Use 'gmail' as the service for Gmail accounts
    secure:true,
    port:465,
    auth: {
        user: "renovatepro27@gmail.com", // Your email address
        pass: "tzdz cwin rouo xbaj" // Your email password or app-specific password
    },
});

// Function to send an email
const sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: process.env.EMAIL_USER, // Sender address (your email)
        to, // Recipient address
        subject, // Email subject
        text, // Email body
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export default sendEmail;