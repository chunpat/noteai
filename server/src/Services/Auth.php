<?php
declare(strict_types=1);

namespace App\Services;

use PDO;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;
use PHPMailer\PHPMailer\SMTP;
use App\Exceptions\BusinessException;
use App\Constants\ErrorCode;

class Auth
{
    private PDO $db;
    private const VERIFICATION_CODE_EXPIRE_MINUTES = 10;
    private const TOKEN_EXPIRE_DAYS = 30;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * 发送验证码
     */
    public function sendVerificationCode(string $email): void
    {
        // 生成6位数字验证码
        $code = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // 设置过期时间
        $expiresAt = date('Y-m-d H:i:s', strtotime('+' . self::VERIFICATION_CODE_EXPIRE_MINUTES . ' minutes'));
        
        // 保存验证码
        $stmt = $this->db->prepare('
            INSERT INTO verification_codes (email, code, expires_at)
            VALUES (:email, :code, :expires_at)
        ');
        
        $stmt->execute([
            'email' => $email,
            'code' => $code,
            'expires_at' => $expiresAt
        ]);

        // 创建PHPMailer实例
        $mail = new PHPMailer(true);
        
        // 配置SMTP
        $mail->isSMTP();
        $mail->Host = $_ENV['MAIL_HOST'];
        $mail->SMTPAuth = true;
        $mail->Username = $_ENV['MAIL_USERNAME'];
        $mail->Password = $_ENV['MAIL_PASSWORD'];
        $mail->SMTPSecure = $_ENV['MAIL_ENCRYPTION'];
        $mail->Port = (int)$_ENV['MAIL_PORT'];
        $mail->CharSet = 'UTF-8';

        // 设置发件人
        $mail->setFrom($_ENV['MAIL_FROM_ADDRESS'], $_ENV['MAIL_FROM_NAME']);
        $mail->addAddress($email);

        // 设置邮件内容
        $mail->isHTML(true);
        $mail->Subject = 'NoteAI 验证码';
        $mail->Body = sprintf(
            '<div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>验证码</h2>
                <p>您的验证码是: <strong style="font-size: 24px; color: #007bff;">%s</strong></p>
                <p>验证码将在 %d 分钟后过期。</p>
                <p>如果这不是您的操作，请忽略此邮件。</p>
            </div>',
            $code,
            self::VERIFICATION_CODE_EXPIRE_MINUTES
        );

        // 发送邮件
        $mail->send();

        // 开发环境直接打印
        if (($_ENV['APP_ENV'] ?? 'production') === 'development') {
            error_log("Verification code for {$email}: {$code}");
        }
    }

    /**
     * 验证码登录
     */
    public function verifyCode(string $email, string $code): array
    {
        // 查找最新的未过期验证码
        $stmt = $this->db->prepare('
            SELECT code, expires_at 
            FROM verification_codes 
            WHERE email = :email 
            ORDER BY created_at DESC 
            LIMIT 1
        ');
        
        $stmt->execute(['email' => $email]);
        $verification = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$verification || strtotime($verification['expires_at']) < time() || $verification['code'] !== $code) {
            throw new BusinessException(ErrorCode::EMAIL_CODE_ERROR);
        }

        // 获取或创建用户
        $user = $this->getUserByEmail($email);
        if (!$user) {
            $user = $this->createUser($email);
        }

        // 生成token
        $token = $this->generateToken($user['id']);

        return [
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'name' => $user['name'],
                'avatar' => $user['avatar']
            ]
        ];
    }

    /**
     * 退出登录
     */
    public function logout(string $token): void
    {
        $stmt = $this->db->prepare('DELETE FROM user_tokens WHERE token = :token');
        $stmt->execute(['token' => $token]);
    }

    /**
     * 从令牌获取用户信息
     */
    public function getUserFromToken(string $token): ?array
    {
        $stmt = $this->db->prepare('
            SELECT u.* 
            FROM users u
            JOIN user_tokens t ON u.id = t.user_id
            WHERE t.token = :token AND t.expires_at > NOW()
        ');
        
        $stmt->execute(['token' => $token]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function getUser(string $token): ?array
    {
        return $this->getUserFromToken($token);
    }

    /**
     * 通过邮箱获取用户
     */
    private function getUserByEmail(string $email): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE email = :email');
        $stmt->execute(['email' => $email]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    /**
     * 创建新用户
     */
    private function createUser(string $email): array
    {
        $name = explode('@', $email)[0]; // 使用邮箱前缀作为默认用户名
        
        $stmt = $this->db->prepare('
            INSERT INTO users (email, name)
            VALUES (:email, :name)
        ');
        
        $stmt->execute([
            'email' => $email,
            'name' => $name
        ]);

        return [
            'id' => $this->db->lastInsertId(),
            'email' => $email,
            'name' => $name,
            'avatar' => null
        ];
    }

    /**
     * 生成用户令牌
     */
    private function generateToken(int $userId): string
    {
        $token = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+' . self::TOKEN_EXPIRE_DAYS . ' days'));
        
        $stmt = $this->db->prepare('
            INSERT INTO user_tokens (user_id, token, expires_at)
            VALUES (:user_id, :token, :expires_at)
        ');
        
        $stmt->execute([
            'user_id' => $userId,
            'token' => $token,
            'expires_at' => $expiresAt
        ]);

        return $token;
    }

    /**
     * 验证请求中的令牌
     */
    public function validateToken(string $token): ?array
    {
        return $this->getUserFromToken($token);
    }
}
