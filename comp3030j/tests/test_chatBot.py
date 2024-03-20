import unittest
from comp3030j import app
from comp3030j.util.chatBot import answer_question


class ChatBotTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()

    def test_answer_question(self):
        user_question = "What tax incentives are available for businesses installing solar energy systems in Ireland? How long will it take to recover the investment costs for solar panels based on current electricity prices in Ireland?"
        answer = answer_question(user_question)
        self.assertIsNotNone(answer)  # Check if the answer is not None


if __name__ == '__main__':
    unittest.main()
