async function getGithubRepoInfo({ owner, repo }) {
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "TalkAPI-Voice-Agent/1.0" },
  });

  if (!res.ok) {
    if (res.status === 404) {
      return {
        success: false,
        error: `Repository "${owner}/${repo}" not found.`,
        spoken_summary: `I couldn't find a repository called ${owner}/${repo} on GitHub. It might be private or the name might be wrong.`,
      };
    }
    return {
      success: false,
      error: `GitHub API error: ${res.status}`,
      spoken_summary: `Sorry, I had trouble fetching that repository from GitHub.`,
    };
  }

  const data = await res.json();

  return {
    success: true,
    data: {
      name: data.full_name,
      description: data.description,
      stars: data.stargazers_count,
      forks: data.forks_count,
      open_issues: data.open_issues_count,
      language: data.language,
      created_at: data.created_at,
      updated_at: data.updated_at,
      url: data.html_url,
    },
    spoken_summary: `${owner}/${repo} is a ${data.language || "multi-language"} repository with ${data.stargazers_count.toLocaleString()} stars, ${data.forks_count.toLocaleString()} forks, and ${data.open_issues_count} open issues. ${data.description || ""}`,
  };
}

async function getGithubIssues({ owner, repo, state = "open" }) {
  const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=${state}&per_page=5`;
  const res = await fetch(url, {
    headers: { "User-Agent": "TalkAPI-Voice-Agent/1.0" },
  });

  if (!res.ok) {
    if (res.status === 404) {
      return {
        success: false,
        error: `Repository "${owner}/${repo}" not found.`,
        spoken_summary: `I couldn't find the repository ${owner}/${repo} on GitHub.`,
      };
    }
    return {
      success: false,
      error: `GitHub API error: ${res.status}`,
      spoken_summary: `Sorry, I had trouble fetching issues from GitHub.`,
    };
  }

  const issues = await res.json();

  if (issues.length === 0) {
    return {
      success: true,
      data: { issues: [], count: 0, state },
      spoken_summary: `There are no ${state} issues in ${owner}/${repo}.`,
    };
  }

  const topIssues = issues.slice(0, 5).map((i) => ({
    number: i.number,
    title: i.title,
    user: i.user.login,
  }));

  return {
    success: true,
    data: { issues: topIssues, count: issues.length, state },
    spoken_summary: `Here are the top ${topIssues.length} ${state} issues in ${owner}/${repo}: ${topIssues.map((i) => `#${i.number} ${i.title}`).join(". ")}.`,
  };
}

async function searchGithubRepos({ query }) {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=5&sort=stars&order=desc`;
  const res = await fetch(url, {
    headers: { "User-Agent": "TalkAPI-Voice-Agent/1.0" },
  });

  if (!res.ok) {
    return {
      success: false,
      error: `GitHub search error: ${res.status}`,
      spoken_summary: `Sorry, I had trouble searching GitHub right now.`,
    };
  }

  const data = await res.json();

  if (!data.items || data.items.length === 0) {
    return {
      success: true,
      data: { repos: [], count: 0, query },
      spoken_summary: `No repositories found for "${query}". Try different keywords.`,
    };
  }

  const repos = data.items.slice(0, 5).map((r) => ({
    full_name: r.full_name,
    description: r.description,
    stars: r.stargazers_count,
    language: r.language,
    url: r.html_url,
  }));

  return {
    success: true,
    data: { repos, count: data.total_count, query },
    spoken_summary: `Found ${data.total_count.toLocaleString()} repos for "${query}". Top results: ${repos.map((r) => `${r.full_name} — ${r.stars.toLocaleString()} stars, ${r.language || "multi-language"}. ${r.description || ""}`).join(" Next: ")}.`,
  };
}

module.exports = { searchGithubRepos, getGithubRepoInfo, getGithubIssues };
