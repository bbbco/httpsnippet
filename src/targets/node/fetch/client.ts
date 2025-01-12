/**
 * @description
 * HTTP code snippet generator for Node.js using node-fetch.
 *
 * @author
 * @hirenoble
 *
 * for any questions or issues regarding the generated code snippet, please open an issue mentioning the author.
 */

import stringifyObject from 'stringify-object';

import { CodeBuilder } from '../../../helpers/code-builder';
import { Client } from '../../targets';

export const fetch: Client = {
  info: {
    key: 'fetch',
    title: 'Fetch',
    link: 'https://github.com/bitinn/node-fetch',
    description: 'Simplified HTTP node-fetch client',
  },
  convert: ({ method, fullUrl, postData, headersObj, cookies }, options) => {
    const opts = {
      indent: '  ',
      ...options,
    };

    let includeFS = false;
    const { blank, push, join, unshift } = new CodeBuilder({ indent: opts.indent });

    push("const fetch = require('node-fetch');");
    const url = fullUrl;
    const reqOpts: Record<string, any> = {
      method,
    };

    if (Object.keys(headersObj).length) {
      reqOpts.headers = headersObj;
    }

    switch (postData.mimeType) {
      case 'application/x-www-form-urlencoded':
        unshift("const { URLSearchParams } = require('url');");
        push('const encodedParams = new URLSearchParams();');
        blank();

        postData.params?.forEach(param => {
          push(`encodedParams.set('${param.name}', '${param.value}');`);
        });

        reqOpts.body = 'encodedParams';
        break;

      case 'application/json':
        if (postData.jsonObj) {
          reqOpts.body = JSON.stringify(postData.jsonObj);
        }
        break;

      case 'multipart/form-data':
        if (!postData.params) {
          break;
        }

        unshift("const FormData = require('form-data');");
        push('const formData = new FormData();');
        blank();

        postData.params.forEach(param => {
          if (!param.fileName && !param.fileName && !param.contentType) {
            push(`formData.append('${param.name}', '${param.value}');`);
            return;
          }

          if (param.fileName) {
            includeFS = true;
            push(`formData.append('${param.name}', fs.createReadStream('${param.fileName}'));`);
          }
        });
        break;

      default:
        if (postData.text) {
          reqOpts.body = postData.text;
        }
    }

    // construct cookies argument
    if (cookies.length) {
      const cookiesString = cookies
        .map(cookie => `${encodeURIComponent(cookie.name)}=${encodeURIComponent(cookie.value)}; `)
        .join('');
      if (reqOpts.headers) {
        reqOpts.headers.cookie = cookiesString;
      } else {
        reqOpts.headers = {};
        reqOpts.headers.cookie = cookiesString;
      }
    }
    blank();
    push(`let url = '${url}';`);
    blank();

    const stringifiedOptions = stringifyObject(reqOpts, { indent: '  ', inlineCharacterLimit: 80 });
    push(`let options = ${stringifiedOptions};`);
    blank();

    if (includeFS) {
      unshift("const fs = require('fs');");
    }
    if (postData.params && postData.mimeType === 'multipart/form-data') {
      push('options.body = formData;');
      blank();
    }
    push('fetch(url, options)');
    push('.then(res => res.json())', 1);
    push('.then(json => console.log(json))', 1);
    push(".catch(err => console.error('error:' + err));", 1);

    return join()
      .replace(/'encodedParams'/, 'encodedParams')
      .replace(/"fs\.createReadStream\(\\"(.+)\\"\)"/, 'fs.createReadStream("$1")');
  },
};
