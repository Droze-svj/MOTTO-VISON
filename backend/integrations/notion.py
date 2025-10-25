from notion_client import Client
 
def get_notion_client(access_token):
    return Client(auth=access_token) 