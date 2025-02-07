import {
  CallableService,
  FetchLike,
  ServiceRequest,
  ServiceRequestInit,
  ServiceSpec,
} from "./types";

const resolveUrl = <TRequest>(
  request: TRequest,
  serviceRequest: ServiceRequest<TRequest>,
): URL | RequestInfo =>
  typeof serviceRequest === "function"
    ? serviceRequest(request)
    : serviceRequest;

const resolveInit = <TRequest>(
  request: TRequest,
  serviceRequestInit?: ServiceRequestInit<TRequest>,
): RequestInit | undefined =>
  typeof serviceRequestInit === "function"
    ? serviceRequestInit(request)
    : serviceRequestInit;

// HTTP 클라이언트는 TRequest 만 받고 TResponse 만 내보내도록 하자.
export class Service {
  private readonly _fetch: FetchLike;
  constructor(fetch?: FetchLike) {
    this._fetch = fetch ?? globalThis.fetch;
  }

  create<TRequest, TResponse = unknown>(
    spec: ServiceSpec<TRequest, TResponse>,
  ): CallableService<TRequest, TResponse> {
    return async (params: TRequest): Promise<TResponse> => {
      const url = resolveUrl(params, spec.url);
      const init = resolveInit(params, spec.init) ?? { method: "GET" };
      const response = await this._fetch(url, init);
      if (spec.transform === undefined) {
        return (await response.json()) as TResponse;
      }
      return await spec.transform(response);
    };
  }
}
