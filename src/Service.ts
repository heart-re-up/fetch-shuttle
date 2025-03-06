import { CallableService, FetchLike, ServiceSpec } from "./types";
import { defaultTransform } from "./utils";

// HTTP 클라이언트는 TRequest 만 받고 TResponse 만 내보내도록 하자.
export class Service {
  private readonly _fetch: FetchLike;
  constructor(fetch?: FetchLike) {
    this._fetch = fetch ?? globalThis.fetch;
  }

  create<TRequest, TResponse = unknown>(
    spec: ServiceSpec<TRequest, TResponse>,
  ): CallableService<TRequest, TResponse> {
    return (async (params: TRequest): Promise<TResponse> => {
      const url = await (typeof spec.url === "function"
        ? spec.url(params)
        : spec.url);
      const init = await (typeof spec.init === "function"
        ? spec.init?.(params)
        : spec.init);
      const response = await this._fetch(url, init);
      if (spec.transform === undefined) {
        return (await defaultTransform(response)) as TResponse;
      } else {
        return await spec.transform(response);
      }
    }) as CallableService<TRequest, TResponse>;
  }
}
