/**
 * URL 문자열을 파싱하여 구성 요소 객체로 변환합니다.
 */
export function parseURL<T extends string>(url: T): URLComponents<T> {
  // 절대 URL 여부 확인
  const isAbsolute = /^[a-z]+:\/\//.test(url);

  // 정규식을 사용하여 URL 구성요소 추출
  let scheme: string | undefined;
  let host: string | undefined;
  let port: number | undefined;
  let pathPart = "";
  let queryPart = "";

  if (isAbsolute) {
    const urlRegex = /^([a-z]+):\/\/([^\/]+)(?:\/([^?]*))?(?:\?(.*))?$/i;
    const match = url.match(urlRegex);

    if (!match) {
      throw new Error(`Invalid absolute URL: ${url}`);
    }

    [, scheme, host, pathPart = "", queryPart = ""] = match;

    // 호스트와 포트 분리 (정규식 사용)
    let hostname = host;
    let portStr: string | null = null;

    // IPv6 주소 처리
    if (host.startsWith("[")) {
      const ipv6Regex = /^\[([^\]]+)\](?::(\d+))?$/;
      const ipv6Match = host.match(ipv6Regex);
      if (ipv6Match) {
        hostname = `[${ipv6Match[1]}]`;
        portStr = ipv6Match[2] || null;
      }
    } else {
      // 일반 호스트:포트 형식
      const hostPortRegex = /^([^:]+)(?::(\d+))?$/;
      const hostPortMatch = host.match(hostPortRegex);
      if (hostPortMatch) {
        hostname = hostPortMatch[1];
        portStr = hostPortMatch[2] || null;
      }
    }

    host = hostname;
    port = portStr ? parseInt(portStr, 10) : undefined;
  } else {
    // 상대 URL 처리
    const urlRegex = /^([^?]*)(?:\?(.*))?$/;
    const match = url.match(urlRegex);

    if (!match) {
      throw new Error(`Invalid relative URL: ${url}`);
    }

    [, pathPart = "", queryPart = ""] = match;
  }

  // 경로 파라미터 추출
  const pathParams = extractPathParams(pathPart);
  const hasPathVariables = Object.keys(pathParams).length > 0;

  // 쿼리 파라미터 추출
  const queryParams = extractQueryParams(queryPart);
  const hasQueryParams = queryPart.length > 0;

  return {
    type: isAbsolute ? "absolute" : "relative",
    scheme,
    host,
    port,
    pathTemplate: pathPart,
    pathVariables: pathParams as Flatten<ExtractURLParams<typeof pathPart>>,
    queryTemplate: queryPart || undefined,
    queryParams: queryParams as Flatten<ExtractQueryParams<typeof queryPart>>,
    hasPathVariables,
    hasQueryParams,
  } as unknown as URLComponents<T>;
}

/**
 * 경로에서 파라미터를 추출합니다.
 */
function extractPathParams(path: string): Record<string, string> {
  const params: Record<string, string> = {};
  const pathSegments = path.split("/");

  for (const segment of pathSegments) {
    if (segment.startsWith(":")) {
      const paramName = segment.substring(1);
      params[paramName] = "";
    }
  }

  return params;
}

/**
 * 쿼리 문자열에서 파라미터를 추출합니다.
 */
function extractQueryParams(query: string): Record<string, string> {
  if (!query) return {};

  const params: Record<string, string> = {};
  const queryParts = query.split("&");

  for (const part of queryParts) {
    const [key, value] = part.split("=");
    if (key) {
      if (value && value.startsWith(":")) {
        // 동적 값
        params[key] = "";
      } else if (value) {
        // 고정 값
        params[key] = value;
      } else {
        // 값이 없는 경우
        params[key] = "";
      }
    }
  }

  return params;
}
