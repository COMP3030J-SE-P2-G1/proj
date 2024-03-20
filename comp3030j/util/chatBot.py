from comp3030j import app
from openai import OpenAI
import json
import requests
from datetime import date, timedelta
import numpy as np

OPENAI_API_KEY = app.config.get('OPENAI_API_KEY')
NEWS_API_KEY = app.config.get("NEWS_API_KEY")
GPT_MODEL = "gpt-3.5-turbo"

client = OpenAI(api_key=OPENAI_API_KEY)


def json_gpt(input: str):
    """
    Sent a request to the OpenAI API to generate a JSON string.
    """
    completion = client.chat.completions.create(
        model=GPT_MODEL,
        messages=[
            {"role": "system", "content": "Output only valid JSON"},
            {"role": "user", "content": input},
        ],
        temperature=0.5
    )

    text = completion.choices[0].message.content
    parsed = json.loads(text)  # parse the JSON string

    return parsed


def embeddings(input: list[str]) -> list[list[float]]:
    """
    Get the embeddings of the input list of strings
    """
    response = client.embeddings.create(model="text-embedding-3-small", input=input)
    return [data.embedding for data in response.data]


def search_related_news(user_question: str) -> list[dict]:
    QUERIES_INPUT = f"""
    You have access to a search API that returns recent news articles.
    Generate an array of search queries that are relevant to this question.
    Use a variation of related keywords for the queries, trying to be as general as possible.
    Include as many queries as you can think of, including and excluding terms.
    For example, include queries like ['keyword_1 keyword_2', 'keyword_1', 'keyword_2'].
    Be creative. The more queries you include, the more likely you are to find relevant results.

    User question: {user_question}

    Format: {{"queries": ["query_1", "query_2", "query_3"]}}
    """

    queries = json_gpt(QUERIES_INPUT)["queries"]
    queries.append(user_question)

    def search_news(
        query: str,
        news_api_key: str = NEWS_API_KEY,
        num_articles: int = 50,  # every query will return max 50 articles
    ) -> dict:
        """
        Use the News API to search for articles related to the query.
        """
        to_datetime = date.today()
        from_datetime = to_datetime - timedelta(days=29)  # 30 days ago
        response = requests.get(
            "https://newsapi.org/v2/everything",
            params={
                "q": query,
                "apiKey": news_api_key,
                "pageSize": num_articles,
                "sortBy": "relevancy",
                "from": from_datetime.isoformat(),
                "to": to_datetime.isoformat(),
            },
        )

        return response.json()

    articles = []
    for query in queries:  # TODO: use tqdm(queries) to show progress bar?
        result = search_news(query)
        if result["status"] == "ok":
            articles = articles + result["articles"]
        else:
            raise Exception(result["message"])

    # Remove duplicates
    articles = list({article["url"]: article for article in articles}.values())
    articles = list({article["title"]: article for article in articles}.values())

    return articles


def rerank_articles(user_question: str, articles: list[dict]) -> list[tuple]:
    HA_INPUT = f"""
    Generate a hypothetical answer to the user's question. This answer will be used to rank search results. 
    Pretend you have all the information you need to answer, but don't use any actual facts. Instead, use placeholders
    like NAME did something, or NAME said something at PLACE. 

    User question: {user_question}

    Format: {{"hypotheticalAnswer": "hypothetical answer text"}}
    """

    hypothetical_answer = json_gpt(HA_INPUT)["hypotheticalAnswer"]
    hypothetical_answer_embedding = embeddings([hypothetical_answer])[0]
    article_embeddings = embeddings(
        [
            f"{article['title']} {article['description']} {article['content'][0:100]}"
            for article in articles
        ]
    )

    # Calculate cosine similarity
    cosine_similarities = []
    for article_embedding in article_embeddings:
        cosine_similarities.append(np.dot(hypothetical_answer_embedding, article_embedding))

    scored_articles = zip(articles, cosine_similarities)

    # Sort articles by cosine similarity
    sorted_articles = sorted(scored_articles, key=lambda x: x[1], reverse=True)

    # print(sorted_articles[0:5])
    return sorted_articles


def generate_answer(user_question: str, sorted_articles: list[tuple]) -> str:
    formatted_top_results = [
        {
            "title": article["title"],
            "description": article["description"],
            "url": article["url"],
        }
        for article, _score in sorted_articles[0:5]
    ]

    ANSWER_INPUT = f"""
    Generate an answer to the user's question based on the given search results.
    TOP_RESULTS: {formatted_top_results}
    USER_QUESTION: {user_question}

    Include as much information as possible in the answer. Reference the relevant search result urls as markdown links.
    """

    completion = client.chat.completions.create(
        model=GPT_MODEL,
        messages=[{"role": "user", "content": ANSWER_INPUT}],
        temperature=0.5,
        stream=True,
    )

    text = ""
    for message in completion:
        content = message.choices[0].delta.content
        if content is not None:
            text += content

    return text


def answer_question(user_question: str) -> str:
    # Step 1: Search related news
    print("Step 1: Searching related news...")
    articles = search_related_news(user_question)
    print(f"Found {len(articles)} related news articles.")

    # Step 2: Re-rank articles
    print("Step 2: Re-ranking articles...")
    sorted_articles = rerank_articles(user_question, articles)
    print("Articles re-ranked.")

    # Step 3: Generate answer
    print("Step 3: Generating answer...")
    answer = generate_answer(user_question, sorted_articles)
    print("Answer generated.")

    print(answer)
    return answer
