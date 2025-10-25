# Rasa Bot Setup

This folder contains your Rasa conversational AI assistant.

## Setup Instructions

### 1. Install Rasa
It is recommended to do this in a separate Python environment:

```bash
pip install rasa
```

### 2. Initialize the Rasa Project

```bash
rasa init
```
- This will create the necessary files and a sample bot.
- You can test the bot interactively with:
  ```bash
  rasa shell
  ```

### 3. Run the Rasa Server (with API enabled)

```bash
rasa run --enable-api
```
- The server will be available at `http://localhost:5005`.

### 4. Customize Your Bot
- Edit `domain.yml`, `data/nlu.yml`, and `data/stories.yml` to define your assistant's behavior.
- Retrain your model after changes:
  ```bash
  rasa train
  ``` 