Contribution Guide
=====================

Welcome to the contributor's guide for Bookmarker PWA! This document outlines the process for reporting issues, submitting pull requests, following coding standards, testing requirements, and adhering to documentation guidelines.

Reporting Issues
---------------

### How to Report Issues

If you encounter a bug or have a feature request, please report it through our [issue tracker](https://github.com/korde/bookmarker-pwa/issues). Please provide as much detail as possible, including:

* A clear description of the issue
* Steps to reproduce the issue
* Expected behavior
* Actual behavior

You can also reach out to us directly at [korde@email.com](mailto:korde@email.com) or through our project Discord channel.

### Issue Labels and Severity

We use the following labels and severity levels for issues:

| Label | Severity |
| --- | --- |
| `bug` | Critical |
| `enhancement` | Major |
| `feature` | Minor |
| `test` | Low |

### Code Review Process

Once an issue is reported, we'll review it and assign a label and priority. We aim to resolve issues within 3-5 business days.

Pull Request Process
---------------------

### How to Submit a Pull Request

To submit a pull request, follow these steps:

1. **Create a new branch**: Fork the repository and create a new branch from the `main` branch.
2. **Make changes**: Make your desired changes to the codebase.
3. **Write tests**: Write unit tests for your changes.
4. **Merge with main**: Merge your branch into `main`.
5. **Create a pull request**: Create a pull request against the `main` branch.

### Code Review Guidelines

*   **Code formatting**: Ensure your code adheres to our [style guide](#coding-standards).
*   **Test coverage**: Aim for 80%+ test coverage.
*   **Documentation updates**: Update any relevant documentation files (e.g., `architecture.md`, `requirements.md`).

Coding Standards
--------------

We follow the standard style guides:

### General Guidelines

*   Indentation: 4 spaces
*   Line length: 120 characters
*   Variable naming conventions:
    *   `var` for global variables
    *   `let` and `const` for local variables
    *   PascalCase for function names
    *   kebab-case for file names

### Example Code Snippet

```javascript
// variable declaration and assignment
const greeting = 'Hello World!';

// function naming convention (PascalCase)
function getGreeting() {
  return 'Hello';
}
```

Testing Requirements
-------------------

We require the following tests:

*   **Unit tests**: Write unit tests for all new features.
*   **Integration tests**: Write integration tests to ensure different components work together.

Documentation Guidelines
---------------------

### Document Format

Our documentation uses Markdown files, including:

*   `architecture.md`
*   `requirements.md`
*   `todo.md`

### Documentation Guidelines

*   **Use headings**: Use H1-H3 headings to structure your content.
*   **Be concise**: Keep each section brief and focused.
*   **Use examples**: Include code snippets or other visual aids to illustrate complex concepts.

Validation Report
-----------------

We use our [validation report](validation-report.md) to ensure the project meets its requirements.

Conclusion
----------

Thank you for contributing to Bookmarker PWA! By following this contribution guide, you can help us build a better product and improve your own development skills. If you have any questions or need further clarification, don't hesitate to reach out.