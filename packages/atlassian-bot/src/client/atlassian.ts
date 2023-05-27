// Description: A simple http client for making HTTP requests to a REST API.
// Something like axios, but with a smaller API surface area and no dependencies.
// This is done as most of the http clients are not available for Cloudflare Workers.

import { AtlassianWorkLog } from './types';

// Common HTTP methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// Request parameters
export type Param = string | number | boolean | Param[];

// Path variables
export type PathVariables = { [k: string]: string };

// Query parameters
export type QueryParams = { [k: string]: Param };

// Options for HTTP requests
export type Options = {
  body?: { [k: string]: any };
  variables?: PathVariables;
  params?: QueryParams;
};

/**
 * A simple http client for making HTTP requests to a Atlassian REST API.
 * Something like axios, but with a smaller API surface area and no dependencies.
 *
 * This is done as most of the http clients are not available for Cloudflare Workers.
 *
 * @param {string} projectId - Atlassian project ID
 * @param {string} token - A base64 encoded token of format email:API_KEY corresponding to Project ID. Used in Basic Auth.
 *
 * @returns Atlassian - Atlassian client
 *
 * @example
 * const atlassian = new Atlassian('project-id', 'token');
 * await atlassian.createWorkLog({issueId: 'ISSUE-1}, <AtlassianWorkLog>{});
 *
 * @see https://developer.atlassian.com/cloud/jira/platform/rest/v2/
 * @see https://developer.atlassian.com/cloud/jira/platform/jira-rest-api-basic-authentication/
 */
export class Atlassian {
  private readonly _apiUrl: string;
  private readonly _projectId: string;
  private readonly _token: string;

  constructor(projectId: string, token: string) {
    this._apiUrl = `https://${projectId}.atlassian.net/rest/api/2`;
    this._projectId = projectId;
    this._token = token;
  }

  /**
   * A generic method to make HTTP requests. It builds the URL, sets the headers
   * and makes the request. It also handles errors and parses the response.
   *
   * @param {HttpMethod} method - HTTP method to use
   * @param {string} url - URL to make the request to
   * @param {Options} options - Options for the request
   *
   * @returns Promise - Response of the request.
   */
  private async _request<R>(
    method: HttpMethod,
    url: URL,
    options: Options,
  ): Promise<R> {
    const { body, variables, params } = options;
    const headers = new Headers();

    // Slack requires the content type to be set to application/json
    // for all the requests. It misbehaves otherwise.
    headers.set('Content-Type', 'application/json; charset=utf-8');

    if (this._token) {
      headers.set('Authorization', `Basic ${this._token}`);
    }

    // Replace the variables in the path
    // For example, /users/:id will become /users/123
    if (variables) {
      for (const [key, value] of Object.entries(variables)) {
        url.pathname = url.pathname.replace(`:${key}`, value);
      }
    }

    // Add the query parameters
    // For example, { limit: 10, offset: 20 } will become ?limit=10&offset=20
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        switch (typeof value) {
          case 'string':
          case 'number':
          case 'boolean':
            url.searchParams.append(key, value.toString());
            break;
          case 'object':
            if (Array.isArray(value)) {
              for (const item of value) {
                url.searchParams.append(`${key}[]`, item.toString());
              }
            }
        }
      }
    }

    // Make the request
    const response = await fetch(url.toString(), {
      method: method,
      headers: headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Handle errors
    if (!response.ok) {
      const error = JSON.stringify(await response.json(), null, 2);
      throw new Error(`Atlassian API error: [${response.status}] - ${error}`);
    }

    return response.json();
  }

  /**
   * Create a work log for an issue.
   *
   * @param variables - A map of path variables
   * @param body - Request body
   *
   * @returns Promise - Response of the request.
   */
  async createWorkLog(variables: { issueId: string }, body: AtlassianWorkLog) {
    return this._request(
      'POST',
      new URL(`${this._apiUrl}/issue/:issueId/worklog`),
      { variables, body },
    );
  }
}
