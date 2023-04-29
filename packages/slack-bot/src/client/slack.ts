// Description: A simple http client for making HTTP requests to a REST API.
// Something like axios, but with a smaller API surface area and no dependencies.
// This is done as most of the http clients are not available for Cloudflare Workers.

import {
  ISlackMessageResponse,
  ISlackOAuthResponse,
  ISlackResponse,
  SlackDeleteMessage,
  SlackHomeView,
  SlackMessage,
  SlackModal,
} from './types';

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
 * Slack client to make requests to the Slack API. It can be considered a wrapper
 * around the fetch API. It is done as most of the http clients are not available
 * for Cloudflare Workers.
 *
 * @param {string} token - Token to use for authentication
 *
 * @example Authorization
 * const client = new Slack();
 * const response = await client.oAuth({ code: "code" });
 *
 * @see https://api.slack.com/methods/views.open
 * @example
 * const client = new Slack("token");
 * const response = await client.openView({ your view });
 *
 */
export class Slack {
  private readonly _baseUrl: string = 'https://slack.com/api';
  private readonly _token: string | null = null;

  constructor(token: string | null = null) {
    this._token = token;
  }

  static getInstances(): Slack {
    return new Slack();
  }

  /**
   * A generic method to make HTTP requests. It builds the URL, sets the headers
   * and makes the request. It also handles errors and parses the response.
   *
   * @param {HttpMethod} method - HTTP method to use
   * @param {string} path - Path of the request
   * @param {Options} options - Options for the request
   *
   * @returns Promise - Response of the request.
   */
  private async _request<R>(
    method: HttpMethod,
    path: string,
    options: Options,
  ): Promise<R> {
    const { body, variables, params } = options;
    const url = new URL(this._baseUrl + path);
    const headers = new Headers();

    // Slack requires the content type to be set to application/json
    // for all the requests. It misbehaves otherwise.
    headers.set('Content-Type', 'application/json; charset=utf-8');

    if (this._token) {
      headers.set('Authorization', `Bearer ${this._token}`);
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
      console.error(await response.json());
      throw new Error(`\n${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Authenticate with Slack using OAuth 2.0. This method will return an access
   * token that can be used to make requests to the Slack API.
   *
   * @see https://api.slack.com/methods/oauth.v2.access
   * @param params
   *
   * @returns Promise - Response of the request.
   */
  async oAuth(params: QueryParams) {
    return await this._request<ISlackOAuthResponse>('GET', '/oauth.v2.access', {
      params,
    });
  }

  /**
   * Opens a modal in Slack using the views.open method.
   * @see https://api.slack.com/methods/views.open
   *
   * @param body - View to open in Slack of type SlackModal
   *
   * @returns {Promise<ISlackResponse>} - Response of the request.
   */
  async openView(body: SlackModal) {
    return this._request<ISlackResponse>('POST', '/views.open', { body });
  }

  /**
   * Sends a message to a channel using the chat.postMessage method.
   * @see https://api.slack.com/methods/chat.postMessage
   *
   * @param body - Message to send to Slack of type SlackMessage
   *
   * @returns {Promise<ISlackMessageResponse>} - Response of the request.
   */
  async postMessage(body: SlackMessage) {
    return this._request<ISlackMessageResponse>('POST', '/chat.postMessage', {
      body,
    });
  }

  /**
   * Publishes a view to a user using the views.publish method.
   * @see https://api.slack.com/methods/views.publish
   *
   * @param body - View to publish to a user of type SlackHomeView
   *
   * @returns {Promise<ISlackResponse>} - Response of the request.
   */
  async publishView(body: SlackHomeView) {
    return this._request<ISlackResponse>('POST', '/views.publish', { body });
  }

  /**
   * Deletes a message using the chat.delete method.
   * @see https://api.slack.com/methods/chat.delete
   *
   * @param body - Message to delete of type SlackDeleteMessage
   *
   * @returns {Promise<ISlackMessageResponse>} - Response of the request.
   */
  async deleteMessage(body: SlackDeleteMessage) {
    return this._request<ISlackMessageResponse>('POST', '/chat.delete', {
      body,
    });
  }
}
