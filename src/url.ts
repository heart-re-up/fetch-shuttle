import { parseURL } from "./url.parser";

// 상대 URL 파싱
const relativeURL = parseURL("/api/users/:userId?page=:page&sort=desc");
console.log(relativeURL);
/*
{
  type: 'relative',
  scheme: null,
  host: null,
  port: null,
  path: '/api/users/:userId',
  pathVariablesType: { userId: '' },
  queryPart: 'page=:page&sort=desc',
  queryParamsType: { page: '', sort: 'desc' },
  hasDynamicQueryParams: true
}
*/

// 절대 URL 파싱
const absoluteURL = parseURL(
  "https://api.example.com:8080/api/users/:userId?page=:page&sort=desc",
);
console.log(absoluteURL);
/*
{
  type: 'absolute',
  scheme: 'https',
  host: 'api.example.com',
  port: '8080',
  path: '/api/users/:userId',
  pathVariablesType: { userId: '' },
  queryPart: 'page=:page&sort=desc',
  queryParamsType: { page: '', sort: 'desc' },
  hasDynamicQueryParams: true
}
*/

// IPv6 URL 파싱
const ipv6URL = parseURL(
  "https://[2001:db8::1]:8080/api/users/:userId?page=:page&sort=desc",
);
console.log(ipv6URL);
/*
{
  type: 'absolute',
  scheme: 'https',
  host: '[2001:db8::1]',
  port: '8080',
  path: '/api/users/:userId',
  pathVariablesType: { userId: '' },
  queryPart: 'page=:page&sort=desc',
  queryParamsType: { page: '', sort: 'desc' },
  hasDynamicQueryParams: true
}
*/
