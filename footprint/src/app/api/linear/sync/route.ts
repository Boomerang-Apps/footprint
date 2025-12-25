import { NextRequest, NextResponse } from 'next/server';

const LINEAR_API_URL = 'https://api.linear.app/graphql';
const LINEAR_API_KEY = process.env.LINEAR_API_KEY;

interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  state: {
    name: string;
    type: string;
  };
}

interface LinearResponse {
  data: {
    issues: {
      nodes: LinearIssue[];
    };
  };
}

// Map Linear status to dashboard status
function mapLinearStatus(linearStatus: string): string {
  const statusMap: Record<string, string> = {
    'Done': 'done',
    'In Review': 'in-review',
    'In Progress': 'in-progress',
    'Blocked': 'blocked',
    'Backlog': 'backlog',
    'Todo': 'backlog',
    'Canceled': 'backlog',
  };
  return statusMap[linearStatus] || 'backlog';
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const issueId = searchParams.get('issueId'); // Single issue sync
  const projectId = searchParams.get('projectId'); // All issues sync

  if (!LINEAR_API_KEY) {
    return NextResponse.json(
      { error: 'LINEAR_API_KEY not configured' },
      { status: 500 }
    );
  }

  try {
    let query: string;
    let variables: Record<string, string>;

    if (issueId) {
      // Fetch single issue by identifier (e.g., UZF-1818)
      query = `
        query IssueByIdentifier($identifier: String!) {
          issue(id: $identifier) {
            id
            identifier
            title
            state {
              name
              type
            }
          }
        }
      `;
      variables = { identifier: issueId };
    } else if (projectId) {
      // Fetch all issues for a project
      query = `
        query ProjectIssues($projectId: String!) {
          project(id: $projectId) {
            issues {
              nodes {
                id
                identifier
                title
                state {
                  name
                  type
                }
              }
            }
          }
        }
      `;
      variables = { projectId };
    } else {
      return NextResponse.json(
        { error: 'Missing issueId or projectId parameter' },
        { status: 400 }
      );
    }

    const response = await fetch(LINEAR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': LINEAR_API_KEY,
      },
      body: JSON.stringify({ query, variables }),
    });

    const data = await response.json();

    if (data.errors) {
      return NextResponse.json(
        { error: data.errors[0]?.message || 'Linear API error' },
        { status: 500 }
      );
    }

    // Transform response
    if (issueId) {
      const issue = data.data?.issue;
      if (!issue) {
        return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
      }
      return NextResponse.json({
        id: issue.identifier,
        status: mapLinearStatus(issue.state?.name),
        linearStatus: issue.state?.name,
        title: issue.title,
      });
    } else {
      const issues = data.data?.project?.issues?.nodes || [];
      const mapped = issues.map((issue: LinearIssue) => ({
        id: issue.identifier,
        status: mapLinearStatus(issue.state?.name),
        linearStatus: issue.state?.name,
        title: issue.title,
      }));
      return NextResponse.json({ issues: mapped });
    }
  } catch (error) {
    console.error('Linear sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync with Linear' },
      { status: 500 }
    );
  }
}
