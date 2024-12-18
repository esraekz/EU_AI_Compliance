from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential

# Azure Form Recognizer settings
endpoint = "AZURE_FORM_RECOGNIZER_ENDPOINT"
api_key = "AZURE_FORM_RECOGNIZER_KEY"

# Initialize the Form Recognizer client
form_recognizer_client = DocumentAnalysisClient(endpoint, AzureKeyCredential(api_key))
