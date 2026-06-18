import nodemailer from 'nodemailer';

/**
 * Sends a notification email when verification status changes.
 * Outputs to console since SMTP server credentials are not configured in environment.
 * 
 * @param {string} toEmail 
 * @param {string} userName 
 * @param {string} status 
 * @param {string} details 
 */
export const sendVerificationEmail = async (toEmail, userName, status, details = '') => {
  const isVerified = status === 'verified';
  const subject = isVerified 
    ? "Meshwar - Verification Succeeded! 🎉" 
    : "Meshwar - Verification Action Required ⚠️";
  
  const textContent = isVerified
    ? `Hello ${userName},\n\nGood news! Your identity and license documents have been successfully verified by our system.\n\nYou now have full access to book any car on Meshwar.\n\nSafe driving!\nThe Meshwar Team`
    : `Hello ${userName},\n\nWe were unable to verify your identity documents.\n\nReason: ${details}\n\nPlease visit your account page, correct the details/re-upload clear images, and retry verification.\n\nBest regards,\nThe Meshwar Team`;

  console.log("\n========================================================");
  console.log(`✉️  [MOCK EMAIL SENT]`);
  console.log(`To:      ${toEmail}`);
  console.log(`Subject: ${subject}`);
  console.log("--------------------------------------------------------");
  console.log(textContent);
  console.log("========================================================\n");
  
  // Return true to show it succeeded
  return true;
};
