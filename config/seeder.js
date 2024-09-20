import MobileVerification from '../models/mobileVerificationModel.js'; 
import User from '../models/userModel.js';

const otpData = {
    mobile: 9967729871,
    otp: 7333,
    expiresAt: new Date("2024-09-20T21:45:59.406Z"),
    createdAt: new Date("2024-09-20T21:40:59.407Z"),
    updatedAt: new Date("2024-09-20T21:40:59.407Z")
};

export const seedOtpData = async () => {
    try {
        
        // await Otp.deleteMany({});

        // Insert new data
        // const otpEntry = new Otp(otpData);
        // await otpEntry.save();
        await MobileVerification.deleteMany();
        await User.deleteMany();

        console.log('OTP data seeded successfully.');
    } catch (error) {
        console.error('Error seeding OTP data:', error);
}
}

