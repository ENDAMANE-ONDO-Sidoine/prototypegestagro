from rest_framework.throttling import AnonRateThrottle


class SignupThrottle(AnonRateThrottle):
    scope = 'signup'


class LoginThrottle(AnonRateThrottle):
    scope = 'login'


class PasswordResetThrottle(AnonRateThrottle):
    scope = 'password_reset'


class EmailVerificationThrottle(AnonRateThrottle):
    scope = 'email_verification'


