import unittest
from unittest import mock

import scripts.jobs.create_issues_from_strategy_doc as script


class TestCreateIssuesFromStrategyDoc(unittest.TestCase):
    def setUp(self):
        self.mock_open = mock.mock_open(read_data="### Task 1\nTask 1 description\n### Task 2\nTask 2 description")
        self.mock_response_success = mock.Mock(status_code=201)
        self.mock_response_rate_limit = mock.Mock(status_code=429, headers={'X-RateLimit-Reset': '60'})
        self.mock_response_auth_fail = mock.Mock(status_code=401)

    def test_read_strategy_md(self):
        with mock.patch('builtins.open', self.mock_open):
            content = script.read_strategy_md('fake_path')
            self.assertIn('Task 1', content)
            self.assertIn('Task 2', content)

    def test_parse_tasks(self):
        markdown_content = "### Task 1\nTask 1 description\n### Task 2\nTask 2 description"
        tasks = script.parse_tasks(markdown_content)
        self.assertEqual(len(tasks), 2)
        self.assertEqual(tasks[0]['title'], 'Task 1')
        self.assertEqual(tasks[1]['body'], 'Task 2 description')

    @mock.patch('requests.post', return_value=mock_response_success)
    def test_create_github_issue_success(self, mock_post):
        script.create_github_issue('Test Issue', 'This is a test issue.', 'fake_token', 'fake_repo')
        mock_post.assert_called_once()

    @mock.patch('requests.post', side_effect=[mock_response_rate_limit, mock_response_success])
    def test_handle_rate_limiting(self, mock_post):
        script.create_github_issue('Rate Limited Issue', 'This tests rate limiting.', 'fake_token', 'fake_repo')
        self.assertEqual(mock_post.call_count, 2)

    @mock.patch('requests.post', return_value=mock_response_auth_fail)
    def test_authentication_failure(self, mock_post):
        with self.assertRaises(Exception) as context:
            script.create_github_issue('Auth Fail Issue', 'This tests auth failure.', 'fake_token', 'fake_repo')
        self.assertTrue('Authentication failed' in str(context.exception))

if __name__ == '__main__':
    unittest.main()
