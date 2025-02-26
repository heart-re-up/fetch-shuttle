# fetch-shuttle

HTTP 요청 서비스 레이어 구성을 위한 라이브러리입니다.

실제 요청을 처리하는 클라이언트 및 응답을 처리하는 비지니스와 별개로 다음 항목만 정의하여 원격 네트워크 요청과 응답에 대한 서비스 레이어를 일관된 방식으로 처리할 수 있도록 합니다.

기본적으로 `fetch` 인터페이스를 따르며 100% 호환됩니다.

# 설치

```bash
pnpm add fetch-shuttle
```

# 사용 방법

## 서비스 스펙

### 기본 구조

`fetch` 인터페이스에서 요구하는 객체를 반환해야 합니다.

필수 속성은 다음과 같습니다.

- `url`: 호출 경로를 정의합니다. 프로토콜과 오리진이 생략되면 현재 브라우저의 웹페이지 컨텍스트를 따릅니다.

선택 속성은 다음과 같습니다.

- `init`: 요청 옵션입니다. 옵션입니다. 생략하면 `{ method: "GET" }` 이 사용됩니다.
- `transform`: 응답을 변환할 수 있습니다. 생략하면 `Response` 에서 `json()` 호출하고 결과 객체를 `unknown` 타입으로 반환됩니다.

이제 간단한 `GET` 스펙을 작성해 봅니다.

```ts
const spec = {
  url: (req: RequestModel) => `/api/v1/something/perform/${req.something}`,
  init: (req: RequestModel) => ({ method: "GET" }),
};
```

위 스펙은 `url` 과 `init` 에 의해서 요청 타입은 추론되지만 `transform` 생략으로 응답 타입이 추론되지 않습니다.

즉 위 서비스를 호출하게 되면 `unknown` 타입의 응답 객체가 반환됩니다.

응답을 추론할 수 있도록 `transform` 함수를 구현할 수 있습니다.

`object` 타입이 추론되도록 작성해 봅니다.

> `transform` 의 매개변수 `response` 는 `fetch` 의 호출 결과인 `Response` 입니다.

```ts
const spec = {
  url: (req: RequestModel) => `/api/v1/something/perform/${req.something}`,
  init: (req: RequestModel) => ({ method: "GET" }),
  transform: async (response) => (await response.json()) as ResponseModel,
};
```

또는 명시적으로 `ServiceSpec` 타입을 선언해서 처리할 수도 있습니다.

`transform` 이 생략되면 내부적으로 `response.json()` 이 호출되지만 `ServiceSpec` 의 두번째 제네릭 파라미터에 의해서 `ResponseModel` 로 잘 처리됩니다.

```ts
// 두번째 제네릭 매개변수가 ResponseModel 이기 때문에 잘 처리됨.
const spec: ServiceSpec<RequestModel, ResponseModel> = {
  url: (req: RequestModel) => `/api/v1/something/perform/${req.something}`,
  init: (req: RequestModel) => ({ method: "GET" }),
};
```

`ServiceSpec` 의 모든 속성은 비동기로 처리 할 수 있습니다.

```ts
const spec: ServiceSpec<RequestModel, ResponseModel> = {
  url: async (req: RequestModel) => {
    // 여기서 다른 비동기 작업 가능.
    return `/api/v1/something/perform/${req.something}`;
  },
  init: async (req: RequestModel) => {
    // 여기서 다른 비동기 작업 가능.
    return { method: "GET" };
  },
  transform: async (response: Response) => {
    // 여기서 다른 비동기 작업 가능.
    return await response.json();
  },
};
```

## 서비스 생성

`ServiceSpec` 은 요청과 응답을 어떻게 처리할지에 대한 속성만 제공합니다.

이제 `ServiceSpec` 을 해석하고 호출 함수를 제작할 수 있는 `Service` 를 생성해야 합니다.

`Service` 는 기본적으로 네트워크 호출에 `fetch` 를 사용합니다.

> 브라우저에서는 `window` 컨텍스트의 `fetch` 가 사용됩니다.

```ts
import { Service } from "fetch-shuttle";

const service = new Service();
```

이제부터 `ServiceSpec` 을 선언하고 `service` 인스턴스에서 `create` 함수를 호출하면 호출 가능한 함수가 반환됩니다.

```ts
import SpecGetSomething from "../../spec-get-something";

// create callable function
const getSomething = service.create(SpecGetSomething);
```

다른 클라이언트를 사용하려면 `Service` 의 생성자에 `FetchLike` 를 처리할 수 있는 함수를 전달합니다.

> `FetchLike` 는 `fetch` 함수의 시그니처와 동일합니다.
>
> `type FetchLike = typeof fetch;`

```ts
import { Service, FetchLike } from "fetch-shuttle";
import axios from "axios";

const fetchLike: FetchLike = (request: URL | RequestInfo, init?: RequestInit) => {
  // 여기서 axios 를 통해서 요청 하도록 구현.
  return axios.request({ ... });
}
const service = new Service(fetchLike);
```

또는

```ts
const service = new Service((request: URL | RequestInfo, init?: RequestInit) => {
  // 여기서 axios 를 통해서 요청 하도록 구현.
  return axios.request({ ... });
});
```

## 서비스 스펙 고급 이용 방법

`ServiceSpec` 은 요청 모델 과 응답 모델을 기준으로 동작합니다. 먼저 요청과 응답 타입을 선언합니다.

> `zod` 등을 이용해서 스키마를 선언하고, 요청 전 유효성 검사를 수행하는 방법도 좋습니다.

```ts
export type RequestGetGitHubUser = {
  name: string;
};

export type ResponseGetGitHubUser = {
  login: string;
  url: string;
  type: string;
  // ... 나머지 속성들
};
```

이제 서비스 스펙을 선언해야 합니다. 서비스 스펙은 다음 속성을 가집니다.

```ts
import type { ServiceSpec } from "fetch-shuttle";

export const spec: ServiceSpec<RequestGetGitHubUser, ResponseGetGitHubUser> = {
  url: (req) => `https://api.github.com/users/${req.name}`,
};
const getUser = service.create(spec);
const response = await getUser({ name: "heart-re-up" });
expect(response.login).toBe("heart-re-up");
expect(response.url).toBe("https://api.github.com/users/heart-re-up");
expect(response.type).toBe("User");
```

`spec` 선언 없이 바로 호출 함수를 생성할 수 있습니다.

```ts
const getUser = service.create<RequestGetGitHubUser, ResponseGetGitHubUser>({
  url: (req) => `https://api.github.com/users/${req.name}`,
});
const response = await getUser({ name: "heart-re-up" });
expect(response.login).toBe("heart-re-up");
expect(response.url).toBe("https://api.github.com/users/heart-re-up");
expect(response.type).toBe("User");
```

`create` 함수에서 타입을 생략하면 `url` 로 부터 요청 타입을 추론하고, `transform` 으로 부터 응답 타입을 추론합니다.

```ts
const getUser = service.create({
  url: (req: RequestGetGitHubUser) =>
    `https://api.github.com/users/${req.name}`,
  transform: async (res) => (await res.json()) as ResponseGetGitHubUser,
});
const response = await getUser({ name: "heart-re-up" });
expect(response.login).toBe("heart-re-up");
expect(response.url).toBe("https://api.github.com/users/heart-re-up");
expect(response.type).toBe("User");
```

`transform` 마저 생략하면 `unknown` 타입으로 응답됩니다. 이 경우 타입 단언이 필요합니다.

```ts
const getUser = service.create({
  url: (req: RequestGetGitHubUser) =>
    `https://api.github.com/users/${req.name}`,
});
const obj = await getUser({ name: "heart-re-up" });
// obj.login => 'response' is of type 'unknown'.ts(18046)
const response = obj as ResponseGetGitHubUser;
expect(response.login).toBe("heart-re-up");
expect(response.url).toBe("https://api.github.com/users/heart-re-up");
expect(response.type).toBe("User");
```

## 추천 사용 방법

서비스 레이어 구성을 위해 각 요청을 하나의 문서처럼 준비하는 것을 추천합니다.

```ts
// GetGitHubUser.ts
export type RequestGetGitHubUser = {
  name: string;
};

export type ResponseGetGitHubUser = {
  login: string;
  url: string;
  type: string;
};

export const GetGitHubUserSpec: ServiceSpec<
  RequestGetGitHubUser,
  ResponseGetGitHubUser
> = {
  url: (req) => `https://api.github.com/users/${req.name}`,
};
```

서비스 수준에서는 다음과 같이 사용합니다.

```ts
import { GetGitHubUserSpec } from "./GetGitHubUser";

const github = {
  getUser: service.create(GetGitHubUserSpec),
};
```

필요한 곳에서 호출합니다.

```ts
const user = await github.getUser({ name: "heart-re-up" });
```

## 유효성 검증 추가

`zod` 등의 유효성 검증 라이브러리를 사용할 때는 다음과 같이 사용합니다.

```ts
import { z } from "zod";

const RequestSchema = z.object({
  name: z.string(),
});

const ResponseSchema = z.object({
  login: z.string(),
  url: z.string(),
  type: z.string(),
});

const spec = {
  url: (req: RequestGetGitHubUser) => {
    if (RequestSchema.safeParse(req).success) {
      return `https://api.github.com/users/${req.name}`;
    }
    throw new Error("Invalid request");
    // 또는 그냥 parse 호출
    // RequestSchema.parse(req);
    return `https://api.github.com/users/${req.name}`;
  },
  init: (req: RequestGetGitHubUser) => {
    return { method: "GET", body: JSON.stringify(RequestSchema.parse(req)) };
  },
  transform: async (res: Response) => {
    return ResponseSchema.parse(await res.json());
  },
};

const getUser = service.create(spec);
const user = await getUser({ name: "heart-re-up" });
```

## void 타입 요청 지원

요청 파라미터가 필요 없는 API를 호출할 때는 `void` 타입을 사용할 수 있습니다. 이 경우 매개변수 없이 함수를 호출할 수 있습니다.

```ts
// void 타입의 요청
const spec: ServiceSpec<void, string> = {
  url: "https://api.github.com/zen",
  transform: async (response) => await response.text(),
};

const getZen = service.create(spec);

// 매개변수 없이 호출 가능
const response = await getZen();
```

## 비동기 URL 및 init 함수 지원

URL과 init 옵션은 Promise를 반환하는 함수로도 제공할 수 있습니다.

```ts
// Promise를 반환하는 URL 함수
const spec: ServiceSpec<RequestGetUser, ResponseGetUser> = {
  url: (req) => Promise.resolve(`https://api.github.com/users/${req.name}`),
};

// Promise를 반환하는 init 함수
const spec: ServiceSpec<PostRequest, PostResponse> = {
  url: "https://httpbin.org/post",
  init: (req) =>
    Promise.resolve({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    }),
};
```

또한 URL 자체를 Promise로 제공할 수도 있습니다.

```ts
const spec: ServiceSpec<RequestGetUser, ResponseGetUser> = {
  url: Promise.resolve("https://api.github.com/users/heart-re-up"),
};
```

## JSON이 아닌 응답 처리

기본적으로 `transform` 함수가 제공되지 않으면 응답은 `response.json()`으로 처리됩니다. 하지만 모든 API가 JSON을 반환하는 것은 아닙니다. 텍스트, 바이너리 등 다른 형식의 응답을 처리하려면 `transform` 함수를 명시적으로 제공해야 합니다.

```ts
// 텍스트 응답 처리
const spec: ServiceSpec<void, string> = {
  url: "https://api.github.com/zen",
  transform: async (response) => await response.text(),
};

// 바이너리 응답 처리
const spec: ServiceSpec<void, Blob> = {
  url: "https://example.com/image.png",
  transform: async (response) => await response.blob(),
};
```
