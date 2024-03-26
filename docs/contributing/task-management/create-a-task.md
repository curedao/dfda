---
title: create-a-task
description: How to create a task
published: false
date: 2022-08-31T08:51:46.609Z
tags: [tasks]
editor: markdown
dateCreated: 2022-07-27T21:36:24.019Z
---

# ➕ How to Create a Task

1. Click the [Issues](https://github.com/FDA-AI/FDAi/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc) tab
2. Search to see if the task already exists
3. If it already exists, click it and up-vote it as described 👉 [here](vote-on-tasks-and-sort-by-priority.md)
4. If not, click the `New issue` button
5. Describe in as much detail as possible and add any tags that you think will be helpful in filtering and sorting

# Automating Task Creation

To automate the creation of GitHub issues for tasks listed in the `docs/treaty/strategy.md` document, you can use the `create_issues_from_strategy_doc.py` script. This script allows for bulk creation of issues, which can save time when dealing with multiple tasks. However, it should be used with caution to avoid creating duplicate issues.

## Prerequisites

- **Python Installation**: Ensure you have Python installed on your system. You can download it from [python.org](https://www.python.org/downloads/).
- **Necessary Python Packages**: The script requires the `requests` package. Install it using pip:
  ```
  pip install requests
  ```
- **GitHub API Token**: You need a GitHub API token with the necessary permissions to create issues in the repository. Follow the instructions on GitHub to create your token.

## Running the Script

1. Ensure all prerequisites are met.
2. Navigate to the directory containing the `create_issues_from_strategy_doc.py` script.
3. Run the script with the following command:
  ```
  python create_issues_from_strategy_doc.py
  ```

Remember to use this script responsibly to avoid creating duplicate issues.
