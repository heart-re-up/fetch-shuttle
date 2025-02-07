# fetch-shuttle

HTTP 요청 서비스 레이어 구성을 위한 라이브러리입니다.

실제 요청을 처리하는 클라이언트 및 응답을 처리하는 비지니스와 별개로 요청과 응답의 대한 스펙만을 선언하여 서비스 레이어를 구성합니다.

- `fetch` 인터페이스
- 별도 의존성 없음
- 타입 안전성

# 설치

```bash
pnpm add fetch-shuttle
```

# 사용 방법

## 서비스 생성

먼저 `ServiceSpec` 을 해석하고, 호출 함수를 제작할 수 있는 `Service` 를 생성합니다.

`Service` 는 기본적으로 `fetch` 를 사용합니다.

```ts
import { Service } from "fetch-shuttle";

const service = new Service();
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

## 서비스 스펙 선언 방법

`ServiceSpec` 은 요청 모델 과 응답 모델을 기준으로 동작합니다. 먼저 요청과 응답 타입을 선언합니다.

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

필수 속성

- `url` : 요청 주소

선택 속성

- `init` : 요청 옵션
- `transform` : 응답 변환 함수

먼저 필수 옵션을 이용한 요청 스펙입니다.

> `init` 을 생략하면 `{ method: "GET" }` 이 기본으로 설정됩니다.
>
> `transform` 을 생략하면 `response.json()` 이 기본으로 호출됩니다.

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
