const EMAILJS_URL = "https://api.emailjs.com/api/v1.0/email/send";

async function sendEmail(templateParams) {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey || !privateKey) {
    console.warn("[email] EmailJS environment variables are not configured");
    return { success: false, error: "EmailJS configuration is missing" };
  }

  try {
    const response = await fetch(EMAILJS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken: privateKey,
        template_params: templateParams,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error(`[email] EmailJS error (${response.status}): ${details}`);
      return { success: false, error: details };
    }

    console.log(`[email] Sent "${templateParams.subject}" to ${templateParams.to_email}`);
    return { success: true };
  } catch (error) {
    console.error("[email] EmailJS request failed:", error.message);
    return { success: false, error: error.message };
  }
}

export const sendWelcomeEmail = (user) => sendEmail({
  to_name: user.name,
  to_email: user.email,
  subject: "Welcome to Micro-Volunteer Match!",
  message: `Welcome to Micro-Volunteer Match, ${user.name}. Your account has been created successfully.`,
  company: "Micro-Volunteer Match",
  role: user.role,
  status_label: "Account Created",
});

export const sendTaskNotificationEmail = (user, task, status, customMessage) => {
  const messages = {
    Created: `Your task "${task.name}" has been created successfully and is now available for volunteers.`,
    Accepted: `You have successfully accepted the task: "${task.name}".`,
    Completed: `You have completed the task: "${task.name}". Your contribution count has been updated.`,
  };

  return sendEmail({
    to_name: user.name,
    to_email: user.email,
    subject: `Task ${status}: ${task.name}`,
    message: customMessage || messages[status] || `Task "${task.name}" status updated to ${status}.`,
    company: "Micro-Volunteer Match",
    role: user.role,
    status_label: status,
  });
};
