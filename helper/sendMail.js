import emailjs from "@emailjs/browser";
import axios from 'axios';

export const sendEmail = async (otp, ip, date) => {
    try {
        const templateData = {
            otp: otp,
            ip: ip,
            date: date,
        };
        console.log("Sending email with payload:", {
            service_id: process.env.SERVICE_ID,
            template_id: process.env.TEMPLATE_ID,
            publicKey: process.env.PUBLIC_KEY,
            template_params: templateData,
        });


        const response = await emailjs.send('https://api.emailjs.com/api/v1.0/email/send', {
            service_id: process.env.SERVICE_ID,
            template_id: process.env.TEMPLATE_ID,
            user_id: process.env.PUBLIC_KEY,  // Use your public key here
            template_params: templateData,
            private_key: process.env.PRIVATE_KEY
        });


        console.log(response.data);
        return response.data; // You can return or handle the response as needed
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Error sending email");
    }
};
