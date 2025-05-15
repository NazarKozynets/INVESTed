namespace server.Models.DTO.Auth;

public class ForgotPasswordModel
{
    public string Email { get; set; } = string.Empty;
}

public class ResetPasswordModel
{
    public string Token { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}