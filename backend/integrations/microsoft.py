import os
from msal import ConfidentialClientApplication

MS_CLIENT_ID = os.getenv("MS_CLIENT_ID")
MS_CLIENT_SECRET = os.getenv("MS_CLIENT_SECRET")
MS_REDIRECT_URI = os.getenv("MS_REDIRECT_URI")
MS_AUTHORITY = "https://login.microsoftonline.com/common"
MS_SCOPES = [
    "Calendars.ReadWrite",
    "Contacts.Read",
    "Mail.ReadWrite"
]

def get_msal_app():
    return ConfidentialClientApplication(
        MS_CLIENT_ID,
        authority=MS_AUTHORITY,
        client_credential=MS_CLIENT_SECRET
    ) 