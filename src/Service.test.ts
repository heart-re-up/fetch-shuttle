import { beforeAll, describe, expect, it } from "vitest";
import type { FetchLike, ServiceSpec } from ".";
import { Service } from ".";
describe("Service", () => {
  let service: Service;

  beforeAll(() => {
    service = new Service(((
      request,
      init: RequestInit = {},
    ): Promise<Response> => {
      const newInit = {
        ...init,
        headers: { ...init.headers, "Content-Type": "application/json" },
      };
      return fetch(request, newInit);
    }) as FetchLike);
  });

  it("GET: without type", async () => {
    const getUser = service.create({
      url: (req: { userId: string }) =>
        `https://api.github.com/users/${req.userId}`,
    });
    const response = (await getUser({ userId: "heart-re-up" })) as {
      login: string;
      url: string;
      type: string;
    };
    expect(response.login).toBe("heart-re-up");
    expect(response.url).toBe("https://api.github.com/users/heart-re-up");
    expect(response.type).toBe("User");
  });

  it("GET with type", async () => {
    type GetRequest = {
      name: string;
    };

    type GetResponse = {
      login: string;
      url: string;
      type: string;
    };
    const getUser = service.create<GetRequest, GetResponse>({
      url: (req) => `https://api.github.com/users/${req.name}`,
      transform: async (res) => (await res.json()) as GetResponse,
    });
    const response = await getUser({ name: "heart-re-up" });
    expect(response.login).toBe("heart-re-up");
    expect(response.url).toBe("https://api.github.com/users/heart-re-up");
    expect(response.type).toBe("User");
  });

  it("POST with type", async () => {
    type PostRequest = {
      name: string;
      age: number;
    };

    type PostResponse = {
      json: {
        name: string;
        age: number;
      };
      url: string;
    };

    const spec: ServiceSpec<PostRequest, PostResponse> = {
      url: () => "https://httpbin.org/post",
      init: (req) => ({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req),
      }),
    };

    const postFunction = service.create(spec);
    const response = await postFunction({ name: "홍길동", age: 30 });
    expect(response.json.name).toBe("홍길동");
    expect(response.json.age).toBe(30);
  });

  it("ServiceSpec 타입을 명시적으로 사용하는 패턴", async () => {
    type RequestGetGitHubUser = {
      name: string;
    };

    type ResponseGetGitHubUser = {
      login: string;
      url: string;
      type: string;
    };

    const spec: ServiceSpec<RequestGetGitHubUser, ResponseGetGitHubUser> = {
      url: (req) => `https://api.github.com/users/${req.name}`,
    };

    const getUser = service.create(spec);
    const response = await getUser({ name: "heart-re-up" });
    expect(response.login).toBe("heart-re-up");
    expect(response.url).toBe("https://api.github.com/users/heart-re-up");
    expect(response.type).toBe("User");
  });

  it("추천 사용 방법 - 분리된 스펙과 서비스 그룹화", async () => {
    type RequestGetGitHubUser = {
      name: string;
    };

    type ResponseGetGitHubUser = {
      login: string;
      url: string;
      type: string;
    };

    const GetGitHubUserSpec: ServiceSpec<
      RequestGetGitHubUser,
      ResponseGetGitHubUser
    > = {
      url: (req) => `https://api.github.com/users/${req.name}`,
    };

    const github = {
      getUser: service.create(GetGitHubUserSpec),
    };

    const response = await github.getUser({ name: "heart-re-up" });
    expect(response.login).toBe("heart-re-up");
    expect(response.url).toBe("https://api.github.com/users/heart-re-up");
    expect(response.type).toBe("User");
  });

  it("Promise를 직접 URL로 사용하는 케이스", async () => {
    type RequestGetUser = {
      name: string;
    };

    type ResponseGetUser = {
      login: string;
      url: string;
      type: string;
    };

    const spec: ServiceSpec<RequestGetUser, ResponseGetUser> = {
      url: Promise.resolve("https://api.github.com/users/heart-re-up"),
    };

    const getUser = service.create(spec);
    const response = await getUser({ name: "not-used" });
    expect(response.login).toBe("heart-re-up");
    expect(response.url).toBe("https://api.github.com/users/heart-re-up");
    expect(response.type).toBe("User");
  });

  it("Promise를 반환하는 함수를 URL로 사용하는 케이스", async () => {
    type RequestGetUser = {
      name: string;
    };

    type ResponseGetUser = {
      login: string;
      url: string;
      type: string;
    };

    const spec: ServiceSpec<RequestGetUser, ResponseGetUser> = {
      url: (req) => Promise.resolve(`https://api.github.com/users/${req.name}`),
    };

    const getUser = service.create(spec);
    const response = await getUser({ name: "heart-re-up" });
    expect(response.login).toBe("heart-re-up");
    expect(response.url).toBe("https://api.github.com/users/heart-re-up");
    expect(response.type).toBe("User");
  });

  it("Promise를 init으로 사용하는 케이스", async () => {
    type PostRequest = {
      name: string;
      age: number;
    };

    type PostResponse = {
      json: {
        name: string;
        age: number;
      };
      url: string;
    };

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

    const postFunction = service.create(spec);
    const response = await postFunction({ name: "홍길동", age: 30 });
    expect(response.json.name).toBe("홍길동");
    expect(response.json.age).toBe(30);
  });
});
