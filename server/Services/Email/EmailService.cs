using System.Net.Mail;
using System.Net;
using System.Security.Cryptography;
using server.services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using server.services.auth;

namespace server.Services.Email;

public class EmailService
{
    private readonly ILogger<EmailService> _logger;
    private readonly IConfiguration _configuration;
    private readonly IServiceProvider _provider;
    
    public EmailService(ILogger<EmailService> logger, IConfiguration configuration, IServiceProvider provider)
    {
        _logger = logger;
        _configuration = configuration;
        _provider = provider;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        try
        {
            var smtpHost = _configuration["Smtp:Host"];
            var smtpPort = _configuration.GetValue<int>("Smtp:Port", 587);
            var smtpUsername = _configuration["Smtp:Username"];
            var smtpPassword = _configuration["Smtp:Password"];
            var fromEmail = _configuration["Smtp:FromEmail"];
            var fromName = _configuration["Smtp:FromName"] ?? "Your Application";

            if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(smtpUsername) || string.IsNullOrEmpty(smtpPassword) || string.IsNullOrEmpty(fromEmail))
            {
                _logger.LogError("SMTP configuration is incomplete.");
                throw new InvalidOperationException("SMTP configuration is missing.");
            }

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                Credentials = new NetworkCredential(smtpUsername, smtpPassword),
                EnableSsl = true
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(fromEmail, fromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            mailMessage.To.Add(to);

            _logger.LogInformation("Sending email to {To} with subject {Subject} at {Time}", to, subject, DateTime.UtcNow);
            await client.SendMailAsync(mailMessage);
            _logger.LogInformation("Email sent successfully to {To}", to);
        }
        catch (SmtpException ex)
        {
            _logger.LogError(ex, "SMTP error sending email to {To} at {Time}", to, DateTime.UtcNow);
            throw new Exception("Failed to send email due to SMTP error.", ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending email to {To} at {Time}", to, DateTime.UtcNow);
            throw new Exception("Failed to send email.", ex);
        }
    }
    
    public async Task<(bool success, string? error)> SendMailAboutResettingPasswordAsync(string to, string token)
    {
        try
        {
            var resetLink = $"{_configuration["App:BaseUrl"]}/reset-password?token={token}";
            var subject = "Password Reset Request";
            var body = $"Click the following link to reset your password: <a href='{resetLink}'>Reset Password</a>";

            await SendEmailAsync(to, subject, body);
            return (true, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending password reset email to {To} at {Time}", to, DateTime.UtcNow);
            return (false, ex.Message);
        }
    }
}