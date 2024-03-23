import json
import os
import re
import time

import requests


def read_strategy_md(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        return file.read()

def parse_tasks(markdown_content):
    tasks = []
    task_pattern = re.compile(r'###\s(.+)\n+([\s\S]+?)(?=\n###|$)')
    matches = task_pattern.findall(markdown_content)
    for match in matches:
        tasks.append({'title': match[0], 'body': match[1].strip()})
    return tasks

def create_github_issue(title, body, token, repo):
    url = f"https://api.github.com/repos/{repo}/issues"
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }
    data = {
        "title": title,
        "body": body
    }
    response = post_github_issue(url, headers, data)
    if response.status_code == 201:
        print(f"Issue '{title}' created successfully.")
    elif response.status_code == 429:
        handle_rate_limit(response, title, body, token, repo)
    elif response.status_code == 401:
        raise Exception("Authentication failed. Check your GitHub token.")
    else:
        raise Exception(f"Failed to create issue '{title}': {response.content}")

def main():
    file_path = "docs/treaty/strategy.md"
    repo = "FDA-AI/FDAi"
    token = os.getenv("GITHUB_TOKEN")
    if not token:
        raise Exception("GitHub token not found. Set the GITHUB_TOKEN environment variable.")
    
    try:
        markdown_content = read_strategy_md(file_path)
        tasks = parse_tasks(markdown_content)
        for task in tasks:
            create_github_issue(task['title'], task['body'], token, repo)
    except FileNotFoundError:
        print(f"File {file_path} not found.")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    main()
