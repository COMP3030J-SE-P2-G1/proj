# ChatBot

## Introduction

`chatbot.py` is a Python script that contains a function named `answer_question` which is used to answer user queries.
The function follows a three-step process:

1. **Search**: `search_related_news`
    1. User asks a question.
    2. GPT generates a list of potential queries.
    3. Search queries are executed in parallel.

2. **Re-rank**: `rerank_articles`
    1. Embeddings for each result are used to calculate semantic similarity to a generated hypothetical ideal answer to
       the user question.
    2. Results are ranked and filtered based on this similarity metric.

3. **Answer**: `generate_answer`
    1. Given the top search results, the model generates an answer to the user’s question, including references and
       links.

## Setup

`OPENAI_API_KEY` and `NEWS_API_KEY` are required.
- `OPENAI_API_KEY`: The OpenAI API key.
- `NEWS_API_KEY`: The News API key, you can get an API key [here](https://newsapi.org/).

The script uses the following Python packages:

- `openai`: Used to call the OpenAI API.
- `json`: Used to parse the JSON api responses and model outputs.
- `requests`: Used to make the API requests.
- `datetime`: Used to handle dates and times.
- `numpy`: Used for cosine similarity calculations.

Before using this script, make sure you have installed these packages and have set the correct OpenAI API key and News
API key.

