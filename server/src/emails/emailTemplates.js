export function createWelcomeEmailTemplate(name, clientURL) {
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Convo</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAFAFA; color: #1A1A1A; margin: 0; padding: 40px 20px;">
  <div style="max-width: 500px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; border: 1px solid #EEEEEE; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
    
    <!-- Logo -->
    <div style="font-size: 20px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 40px;">
      convo<span style="color: #3B82F6;">.</span>
    </div>

    <h1 style="font-size: 24px; font-weight: 600; letter-spacing: -0.5px; margin-bottom: 16px; color: #111111;">Hello ${name},</h1>
    
    <p style="font-size: 15px; line-height: 1.6; color: #444444; margin-bottom: 24px;">
      Thanks for choosing Convo. We designed this platform to take the noise out of messaging—leaving you with a fast, reliable, and beautifully simple way to stay connected.
    </p>

    <!-- Call to Action -->
    <a href="${clientURL}" style="display: inline-block; background-color: #111111; color: #FFFFFF; text-decoration: none; font-size: 14px; font-weight: 500; padding: 12px 28px; border-radius: 6px; margin-bottom: 40px;">
      Open Your Dashboard →
    </a>

    <h2 style="font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #888888; margin-bottom: 16px;">Three things to try first:</h2>
    
    <div style="font-size: 15px; color: #333333; line-height: 2;">
      • <strong style="color: #111111;">Set up your profile</strong> so friends recognize you.<br>
      • <strong style="color: #111111;">Create a Group</strong> to coordinate your projects or hangouts.<br>
      • <strong style="color: #111111;">Enable Desktop Notifications</strong> so you never miss a ping.
    </div>

    <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #EEEEEE; font-size: 14px; color: #666666;">
      Warmly,<br>
      <strong>The Convo Team</strong>
    </div>
  </div>

  <div style="max-width: 500px; margin: 20px auto 0 auto; text-align: center; font-size: 12px; color: #999999;">
    <p>© 2026 Convo Inc. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}
