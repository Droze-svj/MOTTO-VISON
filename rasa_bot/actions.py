from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet, FollowupAction
import datetime
import json
import os
from pathlib import Path
import subprocess
import re
from googletrans import Translator
import random
import logging

class ActionToggleBot(Action):
    def name(self) -> Text:
        return "action_toggle_bot"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get the current state
        is_active = tracker.get_slot("bot_active")
        
        # Toggle the state
        new_state = not is_active if is_active is not None else True
        
        # Set the slot
        return [SlotSet("bot_active", new_state)]