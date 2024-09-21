import MobileVerification from '../models/mobileVerificationModel.js'; 
import User from '../models/userModel.js';

const otpData = {
    // mobile: 9967729871,
    email:"admin@gmail.com",
    otp: 7333,
    // expiresAt: new Date("2024-09-20T21:45:59.406Z"),
    // createdAt: new Date("2024-09-20T21:40:59.407Z"),
    // updatedAt: new Date("2024-09-20T21:40:59.407Z")
    expiresAt : new Date(Date.now() + 10 * 60 * 5000),
    createdAt: new Date(),
    updatedAt: new Date()
};

export const seedOtpData = async () => {
    try {
        
        
        // Insert new data
        await User.deleteMany();
        await MobileVerification.deleteMany();
        // const otpEntry = new MobileVerification(otpData);
        // await otpEntry.save();
        

        console.log('OTP data seeded successfully.');
    } catch (error) {
        console.error('Error seeding OTP data:', error);
}
}

