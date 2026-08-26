"""Optional email notifications for price alerts."""

import os
import smtplib
from email.mime.text import MIMEText


def send_email_alert(config: dict, subject: str, body: str) -> None:
    """Send a plain-text email using the SMTP settings from config['notifications'].

    The SMTP password is read from an environment variable (never store
    it in the JSON config) named by config['notifications']['smtp_password_env'].
    """
    notif_cfg = config.get("notifications", {})
    if not notif_cfg.get("enabled"):
        return

    password = os.environ.get(notif_cfg["smtp_password_env"], "")
    if not password:
        print(
            f"[notifier] WARNING: environment variable "
            f"{notif_cfg['smtp_password_env']} is not set; skipping email alert."
        )
        return

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = notif_cfg["smtp_user"]
    msg["To"] = notif_cfg["to_email"]

    with smtplib.SMTP(notif_cfg["smtp_host"], notif_cfg["smtp_port"]) as server:
        server.starttls()
        server.login(notif_cfg["smtp_user"], password)
        server.sendmail(notif_cfg["smtp_user"], [notif_cfg["to_email"]], msg.as_string())
